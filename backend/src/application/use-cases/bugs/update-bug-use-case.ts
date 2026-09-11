import type { BugRepository } from "@/domain/repositories/bug-repository";
import type { RecipeBookRepository } from "@/domain/repositories/recipe-book-repository";
import type { ProductRepository } from "@/domain/repositories/product-repository";
import {
  type AuthorizationService,
  type AuthorizedActor,
} from "@/domain/services/authorization-service";
import { Bug } from "@/domain/entities/bug";
import type { UpdateBugInput } from "@/application/dtos/bug.dto";
import { type Result, ok, err } from "@/shared/result";
import { notFound, validationError, type AppError } from "@/shared/errors";

export class UpdateBugUseCase {
  constructor(
    private readonly bugs: BugRepository,
    private readonly recipeBooks: RecipeBookRepository,
    private readonly products: ProductRepository,
    private readonly authorization: AuthorizationService
  ) {}

  async execute(
    actor: AuthorizedActor,
    bugId: string,
    input: UpdateBugInput
  ): Promise<Result<Bug, AppError>> {
    const existing = await this.bugs.findById(bugId);
    if (!existing) return err(notFound("Bug"));

    const recipeBook = await this.recipeBooks.findById(existing.recipeBookId);
    if (!recipeBook) return err(notFound("Recipe book"));

    const access = await this.authorization.requireGroupRole(actor, recipeBook.groupId, "QA");
    if (!access.success) return err(access.error);

    const affectedProductIds = input.affectedProductIds ?? existing.affectedProductIds;
    const products = await this.products.findManyByIds(affectedProductIds);
    const belongToGroup = products.every((p) => p.groupId === recipeBook.groupId);
    if (products.length !== affectedProductIds.length || !belongToGroup) {
      return err(validationError("One or more affected products do not belong to this group"));
    }

    const bugResult = Bug.create({
      id: existing.id,
      recipeBookId: existing.recipeBookId,
      affectedProductIds,
      environment: input.environment ?? existing.environment,
      problemDescription: input.problemDescription ?? existing.problemDescription,
      expectedBehavior: input.expectedBehavior ?? existing.expectedBehavior,
      observedBehavior: input.observedBehavior ?? existing.observedBehavior,
      stepsToReproduce: input.stepsToReproduce ?? existing.stepsToReproduce,
      evidenceAndContext: input.evidenceAndContext ?? existing.evidenceAndContext,
      priority: input.priority ?? existing.priority,
      createdById: existing.createdById,
      createdAt: existing.createdAt,
    });
    if (!bugResult.success) return err(bugResult.error);

    return ok(await this.bugs.update(bugResult.data));
  }
}
