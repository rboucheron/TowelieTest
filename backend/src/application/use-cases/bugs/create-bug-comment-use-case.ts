import { randomUUID } from "node:crypto";
import type { BugRepository } from "@/domain/repositories/bug-repository";
import type { BugCommentRepository } from "@/domain/repositories/bug-comment-repository";
import type { RecipeBookRepository } from "@/domain/repositories/recipe-book-repository";
import type { UserRepository } from "@/domain/repositories/user-repository";
import {
  type AuthorizationService,
  type AuthorizedActor,
} from "@/domain/services/authorization-service";
import { BugComment } from "@/domain/entities/bug-comment";
import type { CreateBugCommentInput } from "@/application/dtos/bug.dto";
import type { BugCommentWithAuthor } from "@/application/use-cases/bugs/list-bug-comments-use-case";
import { type Result, ok, err } from "@/shared/result";
import { notFound, type AppError } from "@/shared/errors";

export class CreateBugCommentUseCase {
  constructor(
    private readonly bugs: BugRepository,
    private readonly comments: BugCommentRepository,
    private readonly recipeBooks: RecipeBookRepository,
    private readonly users: UserRepository,
    private readonly authorization: AuthorizationService
  ) {}

  async execute(
    actor: AuthorizedActor,
    bugId: string,
    input: CreateBugCommentInput
  ): Promise<Result<BugCommentWithAuthor, AppError>> {
    const bug = await this.bugs.findById(bugId);
    if (!bug) return err(notFound("Bug"));

    const recipeBook = await this.recipeBooks.findById(bug.recipeBookId);
    if (!recipeBook) return err(notFound("Recipe book"));

    const access = await this.authorization.requireGroupRole(actor, recipeBook.groupId, "USER");
    if (!access.success) return err(access.error);

    const commentResult = BugComment.create({
      id: randomUUID(),
      bugId,
      authorId: actor.userId,
      content: input.content,
      createdAt: new Date(),
    });
    if (!commentResult.success) return err(commentResult.error);

    const comment = await this.comments.create(commentResult.data);
    return ok({ comment, author: await this.users.findById(actor.userId) });
  }
}
