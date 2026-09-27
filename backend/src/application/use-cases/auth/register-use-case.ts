import { randomUUID } from "node:crypto";
import type { UserRepository } from "@/domain/repositories/user-repository";
import type { RefreshTokenRepository } from "@/domain/repositories/refresh-token-repository";
import type { PasswordHasher } from "@/domain/services/password-hasher";
import type { TokenService } from "@/domain/services/token-service";
import { User } from "@/domain/entities/user";
import type { RegisterInput } from "@/application/dtos/auth.dto";
import { issueSession, type SessionDTO } from "@/application/use-cases/auth/issue-session";
import { type Result, ok, err } from "@/shared/result";
import { alreadyExists, type AppError } from "@/shared/errors";

/** Self-service sign-up: creates a regular (non super-admin) account and signs it in. */
export class RegisterUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  async execute(input: RegisterInput): Promise<Result<SessionDTO, AppError>> {
    const email = input.email.trim().toLowerCase();
    if (await this.users.findByEmail(email))
      return err(alreadyExists("An account with this email"));

    const userResult = User.create({
      id: randomUUID(),
      email,
      passwordHash: await this.passwordHasher.hash(input.password),
      firstName: input.firstName,
      lastName: input.lastName,
      isSuperAdmin: false,
      createdAt: new Date(),
    });
    if (!userResult.success) return err(userResult.error);

    const user = await this.users.create(userResult.data);
    return ok(await issueSession(user, this.refreshTokens, this.tokenService));
  }
}
