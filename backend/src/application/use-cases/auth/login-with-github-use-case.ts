import { randomUUID } from "node:crypto";
import type { UserRepository } from "@/domain/repositories/user-repository";
import type { RefreshTokenRepository } from "@/domain/repositories/refresh-token-repository";
import type { TokenService } from "@/domain/services/token-service";
import type { OAuthProvider } from "@/domain/services/oauth-provider";
import { User } from "@/domain/entities/user";
import { issueSession, type SessionDTO } from "@/application/use-cases/auth/issue-session";
import { type Result, ok, err } from "@/shared/result";
import { unauthenticated, validationError, type AppError } from "@/shared/errors";

/**
 * Signs a user in from a GitHub authorization code, creating the account on first use.
 * An existing email/password account is linked only when GitHub vouches for that email
 * (primary + verified), so a GitHub account can't take over someone else's email.
 */
export class LoginWithGithubUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly tokenService: TokenService,
    private readonly github: OAuthProvider
  ) {}

  async execute(code: string): Promise<Result<SessionDTO, AppError>> {
    const profile = await this.github.fetchProfile(code);
    if (!profile) return err(unauthenticated("GitHub sign-in failed"));

    let user = await this.users.findByGithubId(profile.providerUserId);

    if (!user) {
      if (!profile.verifiedEmail) {
        return err(validationError("Your GitHub account has no verified primary email"));
      }
      const email = profile.verifiedEmail.trim().toLowerCase();
      const existing = await this.users.findByEmail(email);

      if (existing) {
        user = await this.users.linkGithubAccount(existing.id, profile.providerUserId);
      } else {
        const userResult = User.create({
          id: randomUUID(),
          email,
          passwordHash: null,
          githubId: profile.providerUserId,
          firstName: profile.firstName,
          lastName: profile.lastName,
          isSuperAdmin: false,
          createdAt: new Date(),
        });
        if (!userResult.success) return err(userResult.error);
        user = await this.users.create(userResult.data);
      }
    }

    return ok(await issueSession(user, this.refreshTokens, this.tokenService));
  }
}
