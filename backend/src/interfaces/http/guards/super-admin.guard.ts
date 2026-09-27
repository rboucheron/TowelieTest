import { Injectable, type CanActivate, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import { forbidden } from "@/shared/errors";
import "@/interfaces/http/types";

/** Must be listed after AuthGuard: `@UseGuards(AuthGuard, SuperAdminGuard)`. */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    if (!req.actor?.isSuperAdmin) throw forbidden("Super-Admin privileges required");
    return true;
  }
}
