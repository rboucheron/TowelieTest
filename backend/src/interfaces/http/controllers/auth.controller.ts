import { Router, type Request, type Response } from "express";
import type { Container } from "@/infrastructure/container";
import { LoginSchema } from "@/application/dtos/auth.dto";
import { asyncHandler } from "@/interfaces/http/middlewares/async-handler";
import { authenticate, requireActor } from "@/interfaces/http/middlewares/authenticate";
import { authRateLimiter } from "@/interfaces/http/middlewares/rate-limiters";
import { sendAppError } from "@/interfaces/http/middlewares/error-handler";
import { unauthenticated } from "@/shared/errors";
import { env } from "@/infrastructure/persistence/env";

const REFRESH_COOKIE = "refresh_token";
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const getCookieValue = (req: Request, name: string): string | undefined => {
  // eslint-disable-next-line security/detect-object-injection -- `name` is always our own REFRESH_COOKIE constant, never user input
  const value: unknown = req.cookies[name];
  return typeof value === "string" ? value : undefined;
};

const setRefreshCookie = (res: Response, token: string): void => {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    path: "/v1/auth",
  });
};

export function createAuthRouter(container: Container): Router {
  const router = Router();
  const { useCases, services } = container;

  router.post(
    "/login",
    authRateLimiter,
    asyncHandler(async (req: Request, res: Response) => {
      const input = LoginSchema.parse(req.body);
      const result = await useCases.login.execute(input);
      if (!result.success) { sendAppError(res, result.error); return; }

      setRefreshCookie(res, result.data.refreshToken);
      res.status(200).json({ accessToken: result.data.accessToken, user: result.data.user });
    })
  );

  router.post(
    "/refresh",
    authRateLimiter,
    asyncHandler(async (req: Request, res: Response) => {
      const presentedToken = getCookieValue(req, REFRESH_COOKIE);
      if (!presentedToken) { sendAppError(res, unauthenticated("No refresh token presented")); return; }

      const result = await useCases.refreshToken.execute(presentedToken);
      if (!result.success) { sendAppError(res, result.error); return; }

      setRefreshCookie(res, result.data.refreshToken);
      res.status(200).json({ accessToken: result.data.accessToken });
    })
  );

  router.post(
    "/logout",
    asyncHandler(async (req: Request, res: Response) => {
      const presentedToken = getCookieValue(req, REFRESH_COOKIE);
      if (presentedToken) await useCases.logout.execute(presentedToken);
      res.clearCookie(REFRESH_COOKIE, { path: "/v1/auth" });
      res.status(204).send();
    })
  );

  router.get(
    "/me",
    authenticate(services.tokenService),
    asyncHandler(async (req: Request, res: Response) => {
      const result = await useCases.getMe.execute(requireActor(req).userId);
      if (!result.success) { sendAppError(res, result.error); return; }
      res.status(200).json(result.data);
    })
  );

  return router;
}
