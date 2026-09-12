import { Router, type Request, type Response } from "express";
import type { Container } from "@/infrastructure/container";
import {
  CreateRecipeBookSchema,
  UpdateRecipeBookSchema,
  type RecipeBookDTO,
} from "@/application/dtos/recipe-book.dto";
import { asyncHandler } from "@/interfaces/http/middlewares/async-handler";
import { authenticate, requireActor } from "@/interfaces/http/middlewares/authenticate";
import { requireParam } from "@/interfaces/http/middlewares/params";
import { sendAppError } from "@/interfaces/http/middlewares/error-handler";
import type { RecipeBook } from "@/domain/entities/recipe-book";

const toRecipeBookDTO = (recipeBook: RecipeBook): RecipeBookDTO => ({
  id: recipeBook.id,
  groupId: recipeBook.groupId,
  title: recipeBook.title,
  description: recipeBook.description,
  logo: recipeBook.logo,
  productIds: recipeBook.productIds,
  createdAt: recipeBook.createdAt.toISOString(),
});

/** Mounted at /v1/groups/:groupId/recipe-books */
export function createGroupRecipeBooksRouter(container: Container): Router {
  const router = Router({ mergeParams: true });
  const { useCases, services } = container;
  router.use(authenticate(services.tokenService));

  router.get(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      const result = await useCases.listRecipeBooks.execute(
        requireActor(req),
        requireParam(req, "groupId")
      );
      if (!result.success) { sendAppError(res, result.error); return; }
      res.status(200).json(result.data.map(toRecipeBookDTO));
    })
  );

  router.post(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      const input = CreateRecipeBookSchema.parse(req.body);
      const result = await useCases.createRecipeBook.execute(
        requireActor(req),
        requireParam(req, "groupId"),
        input
      );
      if (!result.success) { sendAppError(res, result.error); return; }
      res.status(201).json(toRecipeBookDTO(result.data));
    })
  );

  return router;
}

/** Mounted at /v1/recipe-books/:recipeBookId */
export function createRecipeBookRouter(container: Container): Router {
  const router = Router();
  const { useCases, services } = container;
  router.use(authenticate(services.tokenService));

  router.get(
    "/:recipeBookId",
    asyncHandler(async (req: Request, res: Response) => {
      const result = await useCases.getRecipeBook.execute(
        requireActor(req),
        requireParam(req, "recipeBookId")
      );
      if (!result.success) { sendAppError(res, result.error); return; }
      res.status(200).json(toRecipeBookDTO(result.data));
    })
  );

  router.patch(
    "/:recipeBookId",
    asyncHandler(async (req: Request, res: Response) => {
      const input = UpdateRecipeBookSchema.parse(req.body);
      const result = await useCases.updateRecipeBook.execute(
        requireActor(req),
        requireParam(req, "recipeBookId"),
        input
      );
      if (!result.success) { sendAppError(res, result.error); return; }
      res.status(200).json(toRecipeBookDTO(result.data));
    })
  );

  router.delete(
    "/:recipeBookId",
    asyncHandler(async (req: Request, res: Response) => {
      const result = await useCases.removeRecipeBook.execute(
        requireActor(req),
        requireParam(req, "recipeBookId")
      );
      if (!result.success) { sendAppError(res, result.error); return; }
      res.status(204).send();
    })
  );

  return router;
}
