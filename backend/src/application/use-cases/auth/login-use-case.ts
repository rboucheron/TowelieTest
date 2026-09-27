import type { UserRepository } from "@/domain/repositories/user-repository";
import type { RefreshTokenRepository } from "@/domain/repositories/refresh-token-repository";
import type { PasswordHasher } from "@/domain/services/password-hasher";
import type { TokenService } from "@/domain/services/token-service";
import type { LoginInput } from "@/application/dtos/auth.dto";
import { issueSession, type SessionDTO } from "@/application/use-cases/auth/issue-session";
import { type Result, ok, err } from "@/shared/result";
import { invalidCredentials, type AppError } from "@/shared/errors";

export class LoginUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  async execute(input: LoginInput): Promise<Result<SessionDTO, AppError>> {
    const user = await this.users.findByEmail(input.email.trim().toLowerCase());

    if (!user?.passwordHash) return err(invalidCredentials());

    const passwordMatches = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!passwordMatches) return err(invalidCredentials());

    return ok(await issueSession(user, this.refreshTokens, this.tokenService));
  }
}
