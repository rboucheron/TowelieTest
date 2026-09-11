import { Router, type Request, type Response } from "express";
import type { Container } from "@/infrastructure/container";
import { CreateBugSchema, UpdateBugSchema, type BugDTO } from "@/application/dtos/bug.dto";
import { asyncHandler } from "@/interfaces/http/middlewares/async-handler";
import { authenticate, requireActor } from "@/interfaces/http/middlewares/authenticate";
import { requireParam } from "@/interfaces/http/middlewares/params";
import { sendAppError } from "@/interfaces/http/middlewares/error-handler";
import type { Bug } from "@/domain/entities/bug";

const toBugDTO = (bug: Bug): BugDTO => ({
  id: bug.id,
  recipeBookId: bug.recipeBookId,
  affectedProductIds: bug.affectedProductIds,
  environment: bug.environment,
  problemDescription: bug.problemDescription,
  expectedBehavior: bug.expectedBehavior,
  observedBehavior: bug.observedBehavior,
  stepsToReproduce: bug.stepsToReproduce,
  evidenceAndContext: bug.evidenceAndContext,
  priority: bug.priority,
  createdById: bug.createdById,
  createdAt: bug.createdAt.toISOString(),
});

/** Mounted at /v1/recipe-books/:recipeBookId/bugs */
export function createRecipeBookBugsRouter(container: Container): Router {
  const router = Router({ mergeParams: true });
  const { useCases, services } = container;
  router.use(authenticate(services.tokenService));

  router.get(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      const result = await useCases.listBugs.execute(requireActor(req), requireParam(req, "recipeBookId"));
      if (!result.success) { sendAppError(res, result.error); return; }
      res.status(200).json(result.data.map(toBugDTO));
    })
  );

  router.post(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      const input = CreateBugSchema.parse(req.body);
      const result = await useCases.createBug.execute(
        requireActor(req),
        requireParam(req, "recipeBookId"),
        input
      );
      if (!result.success) { sendAppError(res, result.error); return; }
      res.status(201).json(toBugDTO(result.data));
    })
  );

  return router;
}

/** Mounted at /v1/bugs/:bugId */
export function createBugRouter(container: Container): Router {
  const router = Router();
  const { useCases, services } = container;
  router.use(authenticate(services.tokenService));

  router.patch(
    "/:bugId",
    asyncHandler(async (req: Request, res: Response) => {
      const input = UpdateBugSchema.parse(req.body);
      const result = await useCases.updateBug.execute(
        requireActor(req),
        requireParam(req, "bugId"),
        input
      );
      if (!result.success) { sendAppError(res, result.error); return; }
      res.status(200).json(toBugDTO(result.data));
    })
  );

  router.delete(
    "/:bugId",
    asyncHandler(async (req: Request, res: Response) => {
      const result = await useCases.removeBug.execute(requireActor(req), requireParam(req, "bugId"));
      if (!result.success) { sendAppError(res, result.error); return; }
      res.status(204).send();
    })
  );

  return router;
}
