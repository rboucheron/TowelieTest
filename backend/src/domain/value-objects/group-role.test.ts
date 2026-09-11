import { describe, it, expect } from "vitest";
import { roleAtLeast, isGroupRole } from "@/domain/value-objects/group-role";

describe("roleAtLeast", () => {
  it("returns true when the actual role outranks the required role", () => {
    expect(roleAtLeast("ADMIN", "USER")).toBe(true);
    expect(roleAtLeast("MAINTAINER", "QA")).toBe(true);
  });

  it("returns true when the actual role equals the required role", () => {
    expect(roleAtLeast("QA", "QA")).toBe(true);
  });

  it("returns false when the actual role is below the required role", () => {
    expect(roleAtLeast("USER", "QA")).toBe(false);
    expect(roleAtLeast("QA", "ADMIN")).toBe(false);
  });
});

describe("isGroupRole", () => {
  it("accepts every known role", () => {
    expect(isGroupRole("USER")).toBe(true);
    expect(isGroupRole("QA")).toBe(true);
    expect(isGroupRole("MAINTAINER")).toBe(true);
    expect(isGroupRole("ADMIN")).toBe(true);
  });

  it("rejects unknown strings", () => {
    expect(isGroupRole("SUPERADMIN")).toBe(false);
    expect(isGroupRole("")).toBe(false);
  });
});
