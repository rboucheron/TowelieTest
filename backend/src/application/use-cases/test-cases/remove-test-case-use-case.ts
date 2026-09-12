import type { TestCaseRepository } from "@/domain/repositories/test-case-repository";
import type { RecipeBookRepository } from "@/domain/repositories/recipe-book-repository";
import {
  type AuthorizationService,
  type AuthorizedActor,
} from "@/domain/services/authorization-service";
import { type Result, ok, err } from "@/shared/result";
import { notFound, type AppError } from "@/shared/errors";

export class RemoveTestCaseUseCase {
  constructor(
    private readonly testCases: TestCaseRepository,
    private readonly recipeBooks: RecipeBookRepository,
    private readonly authorization: AuthorizationService
  ) {}

  async execute(actor: AuthorizedActor, testCaseId: string): Promise<Result<void, AppError>> {
    const existing = await this.testCases.findById(testCaseId);
    if (!existing) return err(notFound("Test case"));

    const recipeBook = await this.recipeBooks.findById(existing.recipeBookId);
    if (!recipeBook) return err(notFound("Recipe book"));

    const access = await this.authorization.requireGroupRole(actor, recipeBook.groupId, "QA");
    if (!access.success) return err(access.error);

    await this.testCases.remove(testCaseId);
    return ok(undefined);
  }
}
