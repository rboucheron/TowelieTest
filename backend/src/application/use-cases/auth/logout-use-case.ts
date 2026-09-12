import type { RefreshTokenRepository } from "@/domain/repositories/refresh-token-repository";
import type { TokenService } from "@/domain/services/token-service";

export class LogoutUseCase {
  constructor(
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly tokenService: TokenService
  ) {}

  async execute(presentedToken: string): Promise<void> {
    const record = await this.refreshTokens.findByHash(this.tokenService.hashToken(presentedToken));
    if (record?.revokedAt === null) {
      await this.refreshTokens.revoke(record.id);
    }
  }
}
