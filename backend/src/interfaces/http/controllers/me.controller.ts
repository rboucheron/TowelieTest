import { Router, type Request, type Response } from "express";
import type { Container } from "@/infrastructure/container";
import { asyncHandler } from "@/interfaces/http/middlewares/async-handler";
import { authenticate, requireActor } from "@/interfaces/http/middlewares/authenticate";
import { sendAppError } from "@/interfaces/http/middlewares/error-handler";

export function createMeRouter(container: Container): Router {
  const router = Router();

  router.get(
    "/",
    authenticate(container.services.tokenService),
    asyncHandler(async (req: Request, res: Response) => {
      const result = await container.useCases.getMe.execute(requireActor(req).userId);
      if (!result.success) { sendAppError(res, result.error); return; }
      res.status(200).json(result.data);
    })
  );

  return router;
}