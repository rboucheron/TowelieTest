import type { TestCaseRepository } from "@/domain/repositories/test-case-repository";
import type { RecipeBookRepository } from "@/domain/repositories/recipe-book-repository";
import {
  type AuthorizationService,
  type AuthorizedActor,
} from "@/domain/services/authorization-service";
import { TestCase } from "@/domain/entities/test-case";
import type { UpdateTestCaseInput } from "@/application/dtos/test-case.dto";
import { type Result, ok, err } from "@/shared/result";
import { notFound, type AppError } from "@/shared/errors";

export class UpdateTestCaseUseCase {
  constructor(
    private readonly testCases: TestCaseRepository,
    private readonly recipeBooks: RecipeBookRepository,
    private readonly authorization: AuthorizationService
  ) {}

  async execute(
    actor: AuthorizedActor,
    testCaseId: string,
    input: UpdateTestCaseInput
  ): Promise<Result<TestCase, AppError>> {
    const existing = await this.testCases.findById(testCaseId);
    if (!existing) return err(notFound("Test case"));

    const recipeBook = await this.recipeBooks.findById(existing.recipeBookId);
    if (!recipeBook) return err(notFound("Recipe book"));

    const access = await this.authorization.requireGroupRole(actor, recipeBook.groupId, "QA");
    if (!access.success) return err(access.error);

    const testCaseResult = TestCase.create({
      id: existing.id,
      recipeBookId: existing.recipeBookId,
      description: input.description ?? existing.description,
      platform: input.platform ?? existing.platform,
      steps: input.steps ?? existing.steps,
      expectedResult: input.expectedResult ?? existing.expectedResult,
      priority: input.priority ?? existing.priority,
      createdAt: existing.createdAt,
    });
    if (!testCaseResult.success) return err(testCaseResult.error);

    return ok(await this.testCases.update(testCaseResult.data));
  }
}
