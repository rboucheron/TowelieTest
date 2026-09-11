import type { RecipeBookRepository } from "@/domain/repositories/recipe-book-repository";
import {
  type AuthorizationService,
  type AuthorizedActor,
} from "@/domain/services/authorization-service";
import { type Result, ok, err } from "@/shared/result";
import { notFound, type AppError } from "@/shared/errors";

export class RemoveRecipeBookUseCase {
  constructor(
    private readonly recipeBooks: RecipeBookRepository,
    private readonly authorization: AuthorizationService
  ) {}

  async execute(actor: AuthorizedActor, recipeBookId: string): Promise<Result<void, AppError>> {
    const existing = await this.recipeBooks.findById(recipeBookId);
    if (!existing) return err(notFound("Recipe book"));

    const access = await this.authorization.requireGroupRole(actor, existing.groupId, "MAINTAINER");
    if (!access.success) return err(access.error);

    await this.recipeBooks.remove(recipeBookId);
    return ok(undefined);
  }
}
