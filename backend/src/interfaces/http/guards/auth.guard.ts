import { Inject, Injectable, type CanActivate, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { TokenService } from "@/domain/services/token-service";
import { unauthenticated } from "@/shared/errors";
import { TOKEN_SERVICE } from "@/interfaces/http/container.module";
import "@/interfaces/http/types";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(TOKEN_SERVICE) private readonly tokenService: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) throw unauthenticated("Authentication required");

    const payload = this.tokenService.verifyAccessToken(header.slice("Bearer ".length));
    if (!payload) throw unauthenticated("Invalid or expired access token");

    req.actor = { userId: payload.sub, isSuperAdmin: payload.isSuperAdmin };
    return true;
  }
}
