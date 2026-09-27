import { describe, it, expect } from "vitest";
import { BugComment } from "@/domain/entities/bug-comment";

const validProps = {
  id: "c1",
  bugId: "b1",
  authorId: "u1",
  content: "  Reproduced on staging  ",
  createdAt: new Date("2026-01-01"),
};

describe("BugComment.create", () => {
  it("creates a comment and trims its content", () => {
    const result = BugComment.create(validProps);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.content).toBe("Reproduced on staging");
  });

  it("rejects a blank comment", () => {
    const result = BugComment.create({ ...validProps, content: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects a comment longer than 5000 characters", () => {
    const result = BugComment.create({ ...validProps, content: "a".repeat(5001) });
    expect(result.success).toBe(false);
  });
});
