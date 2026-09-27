import type { BugRepository } from "@/domain/repositories/bug-repository";
import type { RecipeBookRepository } from "@/domain/repositories/recipe-book-repository";
import {
  type AuthorizationService,
  type AuthorizedActor,
} from "@/domain/services/authorization-service";
import type { Bug } from "@/domain/entities/bug";
import { type Result, ok, err } from "@/shared/result";
import type { AppError } from "@/shared/errors";

export interface GroupBug {
  bug: Bug;
  recipeBookTitle: string | null;
}

export class ListGroupBugsUseCase {
  constructor(
    private readonly bugs: BugRepository,
    private readonly recipeBooks: RecipeBookRepository,
    private readonly authorization: AuthorizationService
  ) {}

  async execute(actor: AuthorizedActor, groupId: string): Promise<Result<GroupBug[], AppError>> {
    const access = await this.authorization.requireGroupMembership(actor, groupId);
    if (!access.success) return err(access.error);

    const membership = access.data;
    if (membership?.isDeveloper) {
      const bugs = await this.bugs.findAllForGroup(groupId, membership.productIds);
      return ok(bugs.map((bug) => ({ bug, recipeBookTitle: null })));
    }

    const [bugs, recipeBooks] = await Promise.all([
      this.bugs.findAllForGroup(groupId),
      this.recipeBooks.findAllForGroup(groupId),
    ]);
    const titles = new Map(recipeBooks.map((rb) => [rb.id, rb.title]));
    return ok(bugs.map((bug) => ({ bug, recipeBookTitle: titles.get(bug.recipeBookId) ?? null })));
  }
}
