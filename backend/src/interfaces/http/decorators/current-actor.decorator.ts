import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { AuthorizedActor } from "@/domain/services/authorization-service";
import "@/interfaces/http/types";

/** Injects the actor attached by AuthGuard. Every handler using it must be behind that guard. */
export const CurrentActor = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthorizedActor => {
    const req = context.switchToHttp().getRequest<Request>();
    if (!req.actor) {
      throw new Error("@CurrentActor() used on a route not protected by AuthGuard");
    }
    return req.actor;
  }
);
