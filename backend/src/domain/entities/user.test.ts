import { describe, it, expect } from "vitest";
import { User } from "@/domain/entities/user";

const validProps = {
  id: "11111111-1111-1111-1111-111111111111",
  email: "user@example.com",
  passwordHash: "hashed",
  firstName: "Jane",
  lastName: "Doe",
  isSuperAdmin: false,
  createdAt: new Date("2026-01-01"),
};

describe("User.create", () => {
  it("creates a user with valid props", () => {
    const result = User.create(validProps);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
      expect(result.data.firstName).toBe("Jane");
    }
  });

  it("rejects an invalid email", () => {
    const result = User.create({ ...validProps, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty first name", () => {
    const result = User.create({ ...validProps, firstName: "   " });
    expect(result.success).toBe(false);
  });
});

describe("User.reconstitute", () => {
  it("rehydrates a persisted user without re-validating business rules", () => {
    const user = User.reconstitute(validProps);
    expect(user.id).toBe(validProps.id);
    expect(user.isSuperAdmin).toBe(false);
  });
});
