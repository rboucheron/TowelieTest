import { randomUUID } from "node:crypto";
import type { TestCaseRepository } from "@/domain/repositories/test-case-repository";
import type { RecipeBookRepository } from "@/domain/repositories/recipe-book-repository";
import {
  type AuthorizationService,
  type AuthorizedActor,
} from "@/domain/services/authorization-service";
import { TestCase } from "@/domain/entities/test-case";
import type { CreateTestCaseInput } from "@/application/dtos/test-case.dto";
import { type Result, ok, err } from "@/shared/result";
import { notFound, type AppError } from "@/shared/errors";

export class CreateTestCaseUseCase {
  constructor(
    private readonly testCases: TestCaseRepository,
    private readonly recipeBooks: RecipeBookRepository,
    private readonly authorization: AuthorizationService
  ) {}

  async execute(
    actor: AuthorizedActor,
    recipeBookId: string,
    input: CreateTestCaseInput
  ): Promise<Result<TestCase, AppError>> {
    const recipeBook = await this.recipeBooks.findById(recipeBookId);
    if (!recipeBook) return err(notFound("Recipe book"));

    const access = await this.authorization.requireGroupRole(actor, recipeBook.groupId, "QA");
    if (!access.success) return err(access.error);

    const testCaseResult = TestCase.create({
      id: randomUUID(),
      recipeBookId,
      description: input.description,
      platform: input.platform,
      steps: input.steps,
      expectedResult: input.expectedResult,
      priority: input.priority,
      createdAt: new Date(),
    });
    if (!testCaseResult.success) return err(testCaseResult.error);

    return ok(await this.testCases.create(testCaseResult.data));
  }
}
