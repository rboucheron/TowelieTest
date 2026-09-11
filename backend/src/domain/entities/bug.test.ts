import { describe, it, expect } from "vitest";
import { Bug } from "@/domain/entities/bug";

const validProps = {
  id: "b1",
  recipeBookId: "rb1",
  affectedProductIds: ["p1"],
  environment: "Staging",
  problemDescription: "Checkout button does nothing",
  expectedBehavior: "Should navigate to payment",
  observedBehavior: "Nothing happens, no error in console",
  stepsToReproduce: "1. Add item to cart\n2. Click checkout",
  evidenceAndContext: "Screenshot attached",
  priority: "BLOCKING" as const,
  createdById: "u1",
  createdAt: new Date("2026-01-01"),
};

describe("Bug.create", () => {
  it("creates a bug with valid props", () => {
    const result = Bug.create(validProps);
    expect(result.success).toBe(true);
  });

  it("rejects a bug with no affected products", () => {
    const result = Bug.create({ ...validProps, affectedProductIds: [] });
    expect(result.success).toBe(false);
  });

  it("rejects an empty problem description", () => {
    const result = Bug.create({ ...validProps, problemDescription: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty steps to reproduce", () => {
    const result = Bug.create({ ...validProps, stepsToReproduce: "  " });
    expect(result.success).toBe(false);
  });
});
