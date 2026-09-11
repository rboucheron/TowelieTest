import type { TestCaseRepository } from "@/domain/repositories/test-case-repository";
import type { RecipeBookRepository } from "@/domain/repositories/recipe-book-repository";
import {
  type AuthorizationService,
  type AuthorizedActor,
} from "@/domain/services/authorization-service";
import type { TestCase } from "@/domain/entities/test-case";
import { type Result, ok, err } from "@/shared/result";
import { notFound, type AppError } from "@/shared/errors";

export class ListTestCasesUseCase {
  constructor(
    private readonly testCases: TestCaseRepository,
    private readonly recipeBooks: RecipeBookRepository,
    private readonly authorization: AuthorizationService
  ) {}

  async execute(
    actor: AuthorizedActor,
    recipeBookId: string
  ): Promise<Result<TestCase[], AppError>> {
    const recipeBook = await this.recipeBooks.findById(recipeBookId);
    if (!recipeBook) return err(notFound("Recipe book"));

    const access = await this.authorization.requireGroupRole(actor, recipeBook.groupId, "USER");
    if (!access.success) return err(access.error);

    return ok(await this.testCases.findAllForRecipeBook(recipeBookId));
  }
}
