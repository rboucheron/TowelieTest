import { describe, it, expect, vi } from "vitest";
import { CreateBugUseCase } from "@/application/use-cases/bugs/create-bug-use-case";
import { AuthorizationService } from "@/domain/services/authorization-service";
import { RecipeBook } from "@/domain/entities/recipe-book";
import { Product } from "@/domain/entities/product";
import { Membership } from "@/domain/entities/membership";
import type { Bug } from "@/domain/entities/bug";
import type { BugRepository } from "@/domain/repositories/bug-repository";
import type { RecipeBookRepository } from "@/domain/repositories/recipe-book-repository";
import type { ProductRepository } from "@/domain/repositories/product-repository";
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

const productResult = Product.create({ id: "p1", groupId: "g1", name: "Website" });
if (!productResult.success) throw new Error("fixture setup failed");
const product = productResult.data;

const otherGroupProductResult = Product.create({ id: "p2", groupId: "g2", name: "Mobile app" });
if (!otherGroupProductResult.success) throw new Error("fixture setup failed");
const otherGroupProduct = otherGroupProductResult.data;

const qaMembership = Membership.reconstitute({
  id: "m1",
  userId: "u1",
  groupId: "g1",
  role: "QA",
  createdAt: new Date(),
});

const userMembership = Membership.reconstitute({
  id: "m2",
  userId: "u2",
  groupId: "g1",
  role: "USER",
  createdAt: new Date(),
});

function buildUseCase(products: Product[], membership: Membership | null = qaMembership): CreateBugUseCase {
  const bugs: BugRepository = {
    findById: vi.fn(),
    findAllForRecipeBook: vi.fn(),
    create: vi.fn().mockImplementation((bug: Bug) => bug),
    update: vi.fn(),
    remove: vi.fn(),
  };
  const recipeBooks: RecipeBookRepository = {
    findById: vi.fn().mockResolvedValue(recipeBook),
    findAllForGroup: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
  const productRepository: ProductRepository = {
    findById: vi.fn(),
    findAllForGroup: vi.fn(),
    findManyByIds: vi.fn().mockResolvedValue(products),
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
    remove: vi.fn(),
  };

  return new CreateBugUseCase(
    bugs,
    recipeBooks,
    productRepository,
    new AuthorizationService(memberships)
  );
}

const validInput = {
  affectedProductIds: ["p1"],
  environment: "Staging",
  problemDescription: "Checkout crashes",
  expectedBehavior: "Should complete the order",
  observedBehavior: "500 error",
  stepsToReproduce: "Add to cart, checkout",
  evidenceAndContext: "",
  priority: "MAJOR" as const,
};

describe("CreateBugUseCase", () => {
  it("creates a bug when the QA actor and products are valid", async () => {
    const useCase = buildUseCase([product]);
    const result = await useCase.execute({ userId: "u1", isSuperAdmin: false }, "rb1", validInput);
    expect(result.success).toBe(true);
  });

  it("rejects a product that belongs to a different group", async () => {
    const useCase = buildUseCase([otherGroupProduct]);
    const result = await useCase.execute({ userId: "u1", isSuperAdmin: false }, "rb1", validInput);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("VALIDATION_ERROR");
  });

  it("denies a plain USER actor (below QA)", async () => {
    const useCase = buildUseCase([product], userMembership);
    const result = await useCase.execute({ userId: "u2", isSuperAdmin: false }, "rb1", validInput);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("FORBIDDEN");
  });
});
