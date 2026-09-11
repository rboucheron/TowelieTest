import type { RecipeBookRepository } from "@/domain/repositories/recipe-book-repository";
import {
  type AuthorizationService,
  type AuthorizedActor,
} from "@/domain/services/authorization-service";
import type { RecipeBook } from "@/domain/entities/recipe-book";
import { type Result, ok, err } from "@/shared/result";
import type { AppError } from "@/shared/errors";

export class ListRecipeBooksUseCase {
  constructor(
    private readonly recipeBooks: RecipeBookRepository,
    private readonly authorization: AuthorizationService
  ) {}

  async execute(actor: AuthorizedActor, groupId: string): Promise<Result<RecipeBook[], AppError>> {
    const access = await this.authorization.requireGroupRole(actor, groupId, "USER");
    if (!access.success) return err(access.error);

    return ok(await this.recipeBooks.findAllForGroup(groupId));
  }
}
