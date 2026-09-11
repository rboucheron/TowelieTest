import { randomBytes, createHash } from "node:crypto";
import jwt from "jsonwebtoken";
import type { AccessTokenPayload, TokenService } from "@/domain/services/token-service";

const ACCESS_TOKEN_TTL = "15m";

export class JwtTokenService implements TokenService {
  constructor(private readonly accessTokenSecret: string) {}

  signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, this.accessTokenSecret, { expiresIn: ACCESS_TOKEN_TTL });
  }

  verifyAccessToken(token: string): AccessTokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret);
      if (typeof decoded !== "object") return null;
      const { sub, isSuperAdmin } = decoded as Record<string, unknown>;
      if (typeof sub !== "string" || typeof isSuperAdmin !== "boolean") return null;
      return { sub, isSuperAdmin };
    } catch {
      return null;
    }
  }

  generateOpaqueToken(): string {
    return randomBytes(48).toString("base64url");
  }

  hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}
