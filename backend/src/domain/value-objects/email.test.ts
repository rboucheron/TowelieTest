import { describe, it, expect } from "vitest";
import { Email } from "@/domain/value-objects/email";

describe("Email", () => {
  it("accepts a valid address and normalizes casing/whitespace", () => {
    const result = Email.create("  John.Doe@Example.com  ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.toString()).toBe("john.doe@example.com");
    }
  });

  it("rejects an address without an @", () => {
    const result = Email.create("not-an-email");
    expect(result.success).toBe(false);
  });

  it("rejects an empty string", () => {
    const result = Email.create("   ");
    expect(result.success).toBe(false);
  });
});
