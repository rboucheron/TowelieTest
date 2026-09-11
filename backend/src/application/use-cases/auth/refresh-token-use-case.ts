import type { UserRepository } from "@/domain/repositories/user-repository";
import type { RefreshTokenRepository } from "@/domain/repositories/refresh-token-repository";
import type { TokenService } from "@/domain/services/token-service";
import { type Result, ok, err } from "@/shared/result";
import { unauthenticated, type AppError } from "@/shared/errors";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface RefreshResultDTO {
  accessToken: string;
  refreshToken: string;
}

/** Rotates the refresh token on every use so a stolen-but-unused token is a one-shot liability. */
export class RefreshTokenUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly tokenService: TokenService
  ) {}

  async execute(presentedToken: string): Promise<Result<RefreshResultDTO, AppError>> {
    const tokenHash = this.tokenService.hashToken(presentedToken);
    const record = await this.refreshTokens.findByHash(tokenHash);

    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain -- `record` narrows to non-null for the rest of this function only after this whole check passes
    if (!record || record.revokedAt !== null || record.expiresAt < new Date()) {
      return err(unauthenticated("Invalid or expired refresh token"));
    }

    const user = await this.users.findById(record.userId);
    if (!user) return err(unauthenticated("Invalid or expired refresh token"));

    await this.refreshTokens.revoke(record.id);

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

    return ok({ accessToken, refreshToken });
  }
}
