import type { NextFunction, Request, Response } from "express";
import type { AuthorizedActor } from "@/domain/services/authorization-service";
import type { TokenService } from "@/domain/services/token-service";
import "@/interfaces/http/types";

export const authenticate =
  (tokenService: TokenService) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      res.status(401).json({ code: "UNAUTHENTICATED", message: "Authentication required" });
      return;
    }

    const payload = tokenService.verifyAccessToken(header.slice("Bearer ".length));
    if (!payload) {
      res.status(401).json({ code: "UNAUTHENTICATED", message: "Invalid or expired access token" });
      return;
    }

    req.actor = { userId: payload.sub, isSuperAdmin: payload.isSuperAdmin };
    next();
  };

/** Reads the actor attached by `authenticate`. Every route that calls this must be mounted behind it. */
export const requireActor = (req: Request): AuthorizedActor => {
  if (!req.actor) {
    throw new Error("requireActor called on a route not mounted behind the authenticate middleware");
  }
  return req.actor;
};
