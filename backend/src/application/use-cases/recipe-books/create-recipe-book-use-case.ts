import { randomUUID } from "node:crypto";
import type { RecipeBookRepository } from "@/domain/repositories/recipe-book-repository";
import type { ProductRepository } from "@/domain/repositories/product-repository";
import {
  type AuthorizationService,
  type AuthorizedActor,
} from "@/domain/services/authorization-service";
import { RecipeBook } from "@/domain/entities/recipe-book";
import type { CreateRecipeBookInput } from "@/application/dtos/recipe-book.dto";
import { type Result, ok, err } from "@/shared/result";
import { validationError, type AppError } from "@/shared/errors";

export class CreateRecipeBookUseCase {
  constructor(
    private readonly recipeBooks: RecipeBookRepository,
    private readonly products: ProductRepository,
    private readonly authorization: AuthorizationService
  ) {}

  async execute(
    actor: AuthorizedActor,
    groupId: string,
    input: CreateRecipeBookInput
  ): Promise<Result<RecipeBook, AppError>> {
    const access = await this.authorization.requireGroupRole(actor, groupId, "MAINTAINER");
    if (!access.success) return err(access.error);

    if (input.productIds.length > 0) {
      const products = await this.products.findManyByIds(input.productIds);
      const belongToGroup = products.every((p) => p.groupId === groupId);
      if (products.length !== input.productIds.length || !belongToGroup) {
        return err(validationError("One or more products do not belong to this group"));
      }
    }

    const recipeBookResult = RecipeBook.create({
      id: randomUUID(),
      groupId,
      title: input.title,
      description: input.description,
      logo: input.logo ?? null,
      productIds: input.productIds,
      createdAt: new Date(),
    });
    if (!recipeBookResult.success) return err(recipeBookResult.error);

    return ok(await this.recipeBooks.create(recipeBookResult.data));
  }
}
