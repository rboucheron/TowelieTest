import type { BugRepository } from "@/domain/repositories/bug-repository";
import type { RecipeBookRepository } from "@/domain/repositories/recipe-book-repository";
import {
  type AuthorizationService,
  type AuthorizedActor,
} from "@/domain/services/authorization-service";
import { type Result, ok, err } from "@/shared/result";
import { notFound, type AppError } from "@/shared/errors";

export class RemoveBugUseCase {
  constructor(
    private readonly bugs: BugRepository,
    private readonly recipeBooks: RecipeBookRepository,
    private readonly authorization: AuthorizationService
  ) {}

  async execute(actor: AuthorizedActor, bugId: string): Promise<Result<void, AppError>> {
    const existing = await this.bugs.findById(bugId);
    if (!existing) return err(notFound("Bug"));

    const recipeBook = await this.recipeBooks.findById(existing.recipeBookId);
    if (!recipeBook) return err(notFound("Recipe book"));

    const access = await this.authorization.requireGroupRole(actor, recipeBook.groupId, "QA");
    if (!access.success) return err(access.error);

    await this.bugs.remove(bugId);
    return ok(undefined);
  }
}
