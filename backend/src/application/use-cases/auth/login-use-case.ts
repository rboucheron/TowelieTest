import type { UserRepository } from "@/domain/repositories/user-repository";
import type { RefreshTokenRepository } from "@/domain/repositories/refresh-token-repository";
import type { PasswordHasher } from "@/domain/services/password-hasher";
import type { TokenService } from "@/domain/services/token-service";
import type { LoginInput, LoginResultDTO } from "@/application/dtos/auth.dto";
import { type Result, ok, err } from "@/shared/result";
import { invalidCredentials, type AppError } from "@/shared/errors";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export class LoginUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  async execute(
    input: LoginInput
  ): Promise<Result<LoginResultDTO & { refreshToken: string }, AppError>> {
    const user = await this.users.findByEmail(input.email.trim().toLowerCase());
    if (!user) return err(invalidCredentials());

    const passwordMatches = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!passwordMatches) return err(invalidCredentials());

    const accessToken = this.tokenService.signAccessToken({
      sub: user.id,
      isSuperAdmin: user.isSuperAdmin,
    });

    const refreshToken = this.tokenService.generateOpaqueToken();
    await this.refreshTokens.create({
      userId: user.id,
      tokenHash: this.tokenService.hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });

    return ok({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isSuperAdmin: user.isSuperAdmin,
      },
    });
  }
}
