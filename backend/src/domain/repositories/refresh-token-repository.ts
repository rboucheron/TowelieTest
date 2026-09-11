export interface RefreshTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
}

export interface RefreshTokenRepository {
  create(record: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<RefreshTokenRecord>;
  findByHash(tokenHash: string): Promise<RefreshTokenRecord | null>;
  revoke(id: string): Promise<void>;
}
