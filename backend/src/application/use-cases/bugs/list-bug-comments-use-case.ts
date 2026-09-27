import type { BugRepository } from "@/domain/repositories/bug-repository";
import type { BugCommentRepository } from "@/domain/repositories/bug-comment-repository";
import type { RecipeBookRepository } from "@/domain/repositories/recipe-book-repository";
import type { UserRepository } from "@/domain/repositories/user-repository";
import {
  type AuthorizationService,
  type AuthorizedActor,
} from "@/domain/services/authorization-service";
import type { BugComment } from "@/domain/entities/bug-comment";
import type { User } from "@/domain/entities/user";
import { type Result, ok, err } from "@/shared/result";
import { notFound, type AppError } from "@/shared/errors";

export interface BugCommentWithAuthor {
  comment: BugComment;
  author: User | null;
}

export class ListBugCommentsUseCase {
  constructor(
    private readonly bugs: BugRepository,
    private readonly comments: BugCommentRepository,
    private readonly recipeBooks: RecipeBookRepository,
    private readonly users: UserRepository,
    private readonly authorization: AuthorizationService
  ) {}

  async execute(
    actor: AuthorizedActor,
    bugId: string
  ): Promise<Result<BugCommentWithAuthor[], AppError>> {
    const bug = await this.bugs.findById(bugId);
    if (!bug) return err(notFound("Bug"));

    const recipeBook = await this.recipeBooks.findById(bug.recipeBookId);
    if (!recipeBook) return err(notFound("Recipe book"));

    const access = await this.authorization.requireBugAccess(
      actor,
      recipeBook.groupId,
      bug.affectedProductIds
    );
    if (!access.success) return err(access.error);

    const comments = await this.comments.findAllForBug(bugId);
    const authorIds = [...new Set(comments.map((c) => c.authorId))];
    const authors = new Map((await this.users.findManyByIds(authorIds)).map((u) => [u.id, u]));

    return ok(
      comments.map((comment) => ({ comment, author: authors.get(comment.authorId) ?? null }))
    );
  }
}
