import { describe, it, expect, vi } from "vitest";
import { CreateBugCommentUseCase } from "@/application/use-cases/bugs/create-bug-comment-use-case";
import { AuthorizationService } from "@/domain/services/authorization-service";
import { Bug } from "@/domain/entities/bug";
import { RecipeBook } from "@/domain/entities/recipe-book";
import { Membership } from "@/domain/entities/membership";
import { User } from "@/domain/entities/user";
import type { BugComment } from "@/domain/entities/bug-comment";
import type { BugRepository } from "@/domain/repositories/bug-repository";
import type { BugCommentRepository } from "@/domain/repositories/bug-comment-repository";
import type { RecipeBookRepository } from "@/domain/repositories/recipe-book-repository";
import type { UserRepository } from "@/domain/repositories/user-repository";
import type { MembershipRepository } from "@/domain/repositories/membership-repository";

const recipeBookResult = RecipeBook.create({
  id: "rb1",
  groupId: "g1",
  title: "Checkout flow",
  description: "",
  logo: null,
  productIds: [],
  createdAt: new Date(),
});
if (!recipeBookResult.success) throw new Error("fixture setup failed");
const recipeBook = recipeBookResult.data;

const bugResult = Bug.create({
  id: "b1",
  recipeBookId: "rb1",
  affectedProductIds: ["p1"],
  environment: "Staging",
  problemDescription: "Checkout crashes",
  expectedBehavior: "Order completes",
  observedBehavior: "500 error",
  stepsToReproduce: "Checkout",
  evidenceAndContext: "",
  priority: "MAJOR",
  createdById: "u9",
  createdAt: new Date(),
});
if (!bugResult.success) throw new Error("fixture setup failed");
const bug = bugResult.data;

const author = User.reconstitute({
  id: "u1",
  email: "jane@towelie.test",
  passwordHash: null,
  firstName: "Jane",
  lastName: "Doe",
  isSuperAdmin: false,
  createdAt: new Date(),
});

const userMembership = Membership.reconstitute({
  id: "m1",
  userId: "u1",
  groupId: "g1",
  role: "USER",
  createdAt: new Date(),
});

function buildUseCase(opts: { bug?: Bug | null; membership?: Membership | null } = {}): {
  comments: BugCommentRepository;
  useCase: CreateBugCommentUseCase;
} {
  const bugs: BugRepository = {
    findById: vi.fn().mockResolvedValue(opts.bug === undefined ? bug : opts.bug),
    findAllForRecipeBook: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
  const comments: BugCommentRepository = {
    findAllForBug: vi.fn(),
    create: vi.fn().mockImplementation((comment: BugComment) => comment),
  };
  const recipeBooks: RecipeBookRepository = {
    findById: vi.fn().mockResolvedValue(recipeBook),
    findAllForGroup: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
  const users: UserRepository = {
    findById: vi.fn().mockResolvedValue(author),
    findManyByIds: vi.fn(),
    findByEmail: vi.fn(),
    findByGithubId: vi.fn(),
    linkGithubAccount: vi.fn(),
    create: vi.fn(),
  };
  const memberships: MembershipRepository = {
    findByUserAndGroup: vi
      .fn()
      .mockResolvedValue(opts.membership === undefined ? userMembership : opts.membership),
    findAllForGroup: vi.fn(),
    findAllForUser: vi.fn(),
    create: vi.fn(),
    updateRole: vi.fn(),
    remove: vi.fn(),
  };

  return {
    comments,
    useCase: new CreateBugCommentUseCase(
      bugs,
      comments,
      recipeBooks,
      users,
      new AuthorizationService(memberships)
    ),
  };
}

const actor = { userId: "u1", isSuperAdmin: false };

describe("CreateBugCommentUseCase", () => {
  it("lets any group member comment and returns the author", async () => {
    const { useCase, comments } = buildUseCase();
    const result = await useCase.execute(actor, "b1", { content: "Seen on prod too" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.comment.authorId).toBe("u1");
      expect(result.data.author?.firstName).toBe("Jane");
    }
    expect(comments.create).toHaveBeenCalledOnce();
  });

  it("denies an actor outside the group", async () => {
    const { useCase, comments } = buildUseCase({ membership: null });
    const result = await useCase.execute(actor, "b1", { content: "Hello" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("FORBIDDEN");
    expect(comments.create).not.toHaveBeenCalled();
  });

  it("returns NOT_FOUND for an unknown bug", async () => {
    const { useCase } = buildUseCase({ bug: null });
    const result = await useCase.execute(actor, "missing", { content: "Hello" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("NOT_FOUND");
  });
});
