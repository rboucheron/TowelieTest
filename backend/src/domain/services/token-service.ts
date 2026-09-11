export interface AccessTokenPayload {
  sub: string;
  isSuperAdmin: boolean;
}

export interface TokenService {
  signAccessToken(payload: AccessTokenPayload): string;
  verifyAccessToken(token: string): AccessTokenPayload | null;
  generateOpaqueToken(): string;
  hashToken(token: string): string;
}
