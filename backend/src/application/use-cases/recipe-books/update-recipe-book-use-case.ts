import type { RecipeBookRepository } from "@/domain/repositories/recipe-book-repository";
import type { ProductRepository } from "@/domain/repositories/product-repository";
import {
  type AuthorizationService,
  type AuthorizedActor,
} from "@/domain/services/authorization-service";
import { RecipeBook } from "@/domain/entities/recipe-book";
import type { UpdateRecipeBookInput } from "@/application/dtos/recipe-book.dto";
import { type Result, ok, err } from "@/shared/result";
import { notFound, validationError, type AppError } from "@/shared/errors";

export class UpdateRecipeBookUseCase {
  constructor(
    private readonly recipeBooks: RecipeBookRepository,
    private readonly products: ProductRepository,
    private readonly authorization: AuthorizationService
  ) {}

  async execute(
    actor: AuthorizedActor,
    recipeBookId: string,
    input: UpdateRecipeBookInput
  ): Promise<Result<RecipeBook, AppError>> {
    const existing = await this.recipeBooks.findById(recipeBookId);
    if (!existing) return err(notFound("Recipe book"));

    const access = await this.authorization.requireGroupRole(actor, existing.groupId, "MAINTAINER");
    if (!access.success) return err(access.error);

    const productIds = input.productIds ?? existing.productIds;
    if (productIds.length > 0) {
      const products = await this.products.findManyByIds(productIds);
      const belongToGroup = products.every((p) => p.groupId === existing.groupId);
      if (products.length !== productIds.length || !belongToGroup) {
        return err(validationError("One or more products do not belong to this group"));
      }
    }

    const recipeBookResult = RecipeBook.create({
      id: existing.id,
      groupId: existing.groupId,
      title: input.title ?? existing.title,
      description: input.description ?? existing.description,
      logo: input.logo ?? existing.logo,
      productIds,
      createdAt: existing.createdAt,
    });
    if (!recipeBookResult.success) return err(recipeBookResult.error);

    return ok(await this.recipeBooks.update(recipeBookResult.data));
  }
}
