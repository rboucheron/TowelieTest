import type { User } from "@/domain/entities/user";
import type { RefreshTokenRepository } from "@/domain/repositories/refresh-token-repository";
import type { TokenService } from "@/domain/services/token-service";
import type { LoginResultDTO } from "@/application/dtos/auth.dto";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type SessionDTO = LoginResultDTO & { refreshToken: string };

export async function issueSession(
  user: User,
  refreshTokens: RefreshTokenRepository,
  tokenService: TokenService
): Promise<SessionDTO> {
  const accessToken = tokenService.signAccessToken({
    sub: user.id,
    isSuperAdmin: user.isSuperAdmin,
  });

  const refreshToken = tokenService.generateOpaqueToken();
  await refreshTokens.create({
    userId: user.id,
    tokenHash: tokenService.hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isSuperAdmin: user.isSuperAdmin,
    },
  };
}
