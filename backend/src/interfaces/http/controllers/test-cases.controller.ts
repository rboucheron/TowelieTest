import { Router, type Request, type Response } from "express";
import type { Container } from "@/infrastructure/container";
import {
  CreateTestCaseSchema,
  UpdateTestCaseSchema,
  type TestCaseDTO,
} from "@/application/dtos/test-case.dto";
import { asyncHandler } from "@/interfaces/http/middlewares/async-handler";
import { authenticate, requireActor } from "@/interfaces/http/middlewares/authenticate";
import { requireParam } from "@/interfaces/http/middlewares/params";
import { sendAppError } from "@/interfaces/http/middlewares/error-handler";
import type { TestCase } from "@/domain/entities/test-case";

const toTestCaseDTO = (testCase: TestCase): TestCaseDTO => ({
  id: testCase.id,
  recipeBookId: testCase.recipeBookId,
  description: testCase.description,
  platform: testCase.platform,
  steps: testCase.steps,
  expectedResult: testCase.expectedResult,
  priority: testCase.priority,
  createdAt: testCase.createdAt.toISOString(),
});

/** Mounted at /v1/recipe-books/:recipeBookId/test-cases */
export function createRecipeBookTestCasesRouter(container: Container): Router {
  const router = Router({ mergeParams: true });
  const { useCases, services } = container;
  router.use(authenticate(services.tokenService));

  router.get(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      const result = await useCases.listTestCases.execute(
        requireActor(req),
        requireParam(req, "recipeBookId")
      );
      if (!result.success) { sendAppError(res, result.error); return; }
      res.status(200).json(result.data.map(toTestCaseDTO));
    })
  );

  router.post(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      const input = CreateTestCaseSchema.parse(req.body);
      const result = await useCases.createTestCase.execute(
        requireActor(req),
        requireParam(req, "recipeBookId"),
        input
      );
      if (!result.success) { sendAppError(res, result.error); return; }
      res.status(201).json(toTestCaseDTO(result.data));
    })
  );

  return router;
}

/** Mounted at /v1/test-cases/:testCaseId */
export function createTestCaseRouter(container: Container): Router {
  const router = Router();
  const { useCases, services } = container;
  router.use(authenticate(services.tokenService));

  router.patch(
    "/:testCaseId",
    asyncHandler(async (req: Request, res: Response) => {
      const input = UpdateTestCaseSchema.parse(req.body);
      const result = await useCases.updateTestCase.execute(
        requireActor(req),
        requireParam(req, "testCaseId"),
        input
      );
      if (!result.success) { sendAppError(res, result.error); return; }
      res.status(200).json(toTestCaseDTO(result.data));
    })
  );

  router.delete(
    "/:testCaseId",
    asyncHandler(async (req: Request, res: Response) => {
      const result = await useCases.removeTestCase.execute(
        requireActor(req),
        requireParam(req, "testCaseId")
      );
      if (!result.success) { sendAppError(res, result.error); return; }
      res.status(204).send();
    })
  );

  return router;
}
