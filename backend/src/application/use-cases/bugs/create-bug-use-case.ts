import { randomUUID } from "node:crypto";
import type { BugRepository } from "@/domain/repositories/bug-repository";
import type { RecipeBookRepository } from "@/domain/repositories/recipe-book-repository";
import type { ProductRepository } from "@/domain/repositories/product-repository";
import {
  type AuthorizationService,
  type AuthorizedActor,
} from "@/domain/services/authorization-service";
import { Bug } from "@/domain/entities/bug";
import type { CreateBugInput } from "@/application/dtos/bug.dto";
import { type Result, ok, err } from "@/shared/result";
import { notFound, validationError, type AppError } from "@/shared/errors";

export class CreateBugUseCase {
  constructor(
    private readonly bugs: BugRepository,
    private readonly recipeBooks: RecipeBookRepository,
    private readonly products: ProductRepository,
    private readonly authorization: AuthorizationService
  ) {}

  async execute(
    actor: AuthorizedActor,
    recipeBookId: string,
    input: CreateBugInput
  ): Promise<Result<Bug, AppError>> {
    const recipeBook = await this.recipeBooks.findById(recipeBookId);
    if (!recipeBook) return err(notFound("Recipe book"));

    const access = await this.authorization.requireGroupRole(actor, recipeBook.groupId, "QA");
    if (!access.success) return err(access.error);

    const products = await this.products.findManyByIds(input.affectedProductIds);
    const belongToGroup = products.every((p) => p.groupId === recipeBook.groupId);
    if (products.length !== input.affectedProductIds.length || !belongToGroup) {
      return err(validationError("One or more affected products do not belong to this group"));
    }

    const bugResult = Bug.create({
      id: randomUUID(),
      recipeBookId,
      affectedProductIds: input.affectedProductIds,
      environment: input.environment,
      problemDescription: input.problemDescription,
      expectedBehavior: input.expectedBehavior,
      observedBehavior: input.observedBehavior,
      stepsToReproduce: input.stepsToReproduce,
      evidenceAndContext: input.evidenceAndContext,
      priority: input.priority,
      createdById: actor.userId,
      createdAt: new Date(),
    });
    if (!bugResult.success) return err(bugResult.error);

    return ok(await this.bugs.create(bugResult.data));
  }
}
