import type { BugRepository } from "@/domain/repositories/bug-repository";
import type { RecipeBookRepository } from "@/domain/repositories/recipe-book-repository";
import type { UserRepository } from "@/domain/repositories/user-repository";
import {
  type AuthorizationService,
  type AuthorizedActor,
} from "@/domain/services/authorization-service";
import type { Bug } from "@/domain/entities/bug";
import type { User } from "@/domain/entities/user";
import { type Result, ok, err } from "@/shared/result";
import { notFound, type AppError } from "@/shared/errors";

export interface BugWithAuthor {
  bug: Bug;
  author: User | null;
}

export class GetBugUseCase {
  constructor(
    private readonly bugs: BugRepository,
    private readonly recipeBooks: RecipeBookRepository,
    private readonly users: UserRepository,
    private readonly authorization: AuthorizationService
  ) {}

  async execute(actor: AuthorizedActor, bugId: string): Promise<Result<BugWithAuthor, AppError>> {
    const bug = await this.bugs.findById(bugId);
    if (!bug) return err(notFound("Bug"));

    const recipeBook = await this.recipeBooks.findById(bug.recipeBookId);
    if (!recipeBook) return err(notFound("Recipe book"));

    const access = await this.authorization.requireGroupRole(actor, recipeBook.groupId, "USER");
    if (!access.success) return err(access.error);

    return ok({ bug, author: await this.users.findById(bug.createdById) });
  }
}
