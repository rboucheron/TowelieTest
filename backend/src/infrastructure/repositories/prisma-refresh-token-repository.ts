import type { PrismaClient } from "@prisma/client";
import type {
  RefreshTokenRepository,
  RefreshTokenRecord,
} from "@/domain/repositories/refresh-token-repository";

export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<RefreshTokenRecord> {
    return this.prisma.refreshToken.create({ data: input });
  }

  async findByHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    return this.prisma.refreshToken.findUnique({ where: { tokenHash } });
  }

  async revoke(id: string): Promise<void> {
    await this.prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } });
  }
}
