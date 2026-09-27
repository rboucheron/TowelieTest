import { describe, it, expect, vi } from "vitest";
import { ListGroupBugsUseCase } from "@/application/use-cases/bugs/list-group-bugs-use-case";
import { AuthorizationService } from "@/domain/services/authorization-service";
import { Membership } from "@/domain/entities/membership";
import { RecipeBook } from "@/domain/entities/recipe-book";
import type { BugRepository } from "@/domain/repositories/bug-repository";
import type { RecipeBookRepository } from "@/domain/repositories/recipe-book-repository";
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

function buildUseCase(membership: Membership | null): {
  bugs: BugRepository;
  recipeBooks: RecipeBookRepository;
  useCase: ListGroupBugsUseCase;
} {
  const bugs: BugRepository = {
    findById: vi.fn(),
    findAllForRecipeBook: vi.fn(),
    findAllForGroup: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
  const recipeBooks: RecipeBookRepository = {
    findById: vi.fn(),
    findAllForGroup: vi.fn().mockResolvedValue([recipeBook]),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
  const memberships: MembershipRepository = {
    findByUserAndGroup: vi.fn().mockResolvedValue(membership),
    findAllForGroup: vi.fn(),
    findAllForUser: vi.fn(),
    create: vi.fn(),
    updateRole: vi.fn(),
    setProducts: vi.fn(),
    remove: vi.fn(),
  };
  return {
    bugs,
    recipeBooks,
    useCase: new ListGroupBugsUseCase(bugs, recipeBooks, new AuthorizationService(memberships)),
  };
}

const actor = { userId: "u1", isSuperAdmin: false };

describe("ListGroupBugsUseCase", () => {
  it("filters a developer's bugs by their product scope without reading recipe books", async () => {
    const developer = Membership.reconstitute({
      id: "m1",
      userId: "u1",
      groupId: "g1",
      role: "DEVELOPER",
      productIds: ["p1", "p2"],
      createdAt: new Date(),
    });
    const { useCase, bugs, recipeBooks } = buildUseCase(developer);
    const result = await useCase.execute(actor, "g1");
    expect(result.success).toBe(true);
    expect(bugs.findAllForGroup).toHaveBeenCalledWith("g1", ["p1", "p2"]);
    expect(recipeBooks.findAllForGroup).not.toHaveBeenCalled();
  });

  it("returns every bug of the group to a regular member", async () => {
    const member = Membership.reconstitute({
      id: "m1",
      userId: "u1",
      groupId: "g1",
      role: "USER",
      createdAt: new Date(),
    });
    const { useCase, bugs } = buildUseCase(member);
    const result = await useCase.execute(actor, "g1");
    expect(result.success).toBe(true);
    expect(bugs.findAllForGroup).toHaveBeenCalledWith("g1");
  });

  it("denies a non-member", async () => {
    const { useCase } = buildUseCase(null);
    const result = await useCase.execute(actor, "g1");
    expect(result.success).toBe(false);
  });
});
