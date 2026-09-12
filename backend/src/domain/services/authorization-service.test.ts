import { describe, it, expect, vi } from "vitest";
import { AuthorizationService } from "@/domain/services/authorization-service";
import type { MembershipRepository } from "@/domain/repositories/membership-repository";
import { Membership } from "@/domain/entities/membership";

const membership = Membership.reconstitute({
  id: "m1",
  userId: "u1",
  groupId: "g1",
  role: "QA",
  createdAt: new Date(),
});

function buildRepository(found: Membership | null): MembershipRepository {
  return {
    findByUserAndGroup: vi.fn().mockResolvedValue(found),
    findAllForGroup: vi.fn(),
    findAllForUser: vi.fn(),
    create: vi.fn(),
    updateRole: vi.fn(),
    remove: vi.fn(),
  };
}

describe("AuthorizationService.requireGroupRole", () => {
  it("grants access to a Super-Admin regardless of membership", async () => {
    const service = new AuthorizationService(buildRepository(null));
    const result = await service.requireGroupRole(
      { userId: "u1", isSuperAdmin: true },
      "g1",
      "ADMIN"
    );
    expect(result.success).toBe(true);
  });

  it("grants access when the member's role meets the requirement", async () => {
    const service = new AuthorizationService(buildRepository(membership));
    const result = await service.requireGroupRole(
      { userId: "u1", isSuperAdmin: false },
      "g1",
      "USER"
    );
    expect(result.success).toBe(true);
  });

  it("denies access when the member's role is below the requirement", async () => {
    const service = new AuthorizationService(buildRepository(membership));
    const result = await service.requireGroupRole(
      { userId: "u1", isSuperAdmin: false },
      "g1",
      "ADMIN"
    );
    expect(result.success).toBe(false);
  });

  it("denies access when there is no membership at all", async () => {
    const service = new AuthorizationService(buildRepository(null));
    const result = await service.requireGroupRole(
      { userId: "u2", isSuperAdmin: false },
      "g1",
      "USER"
    );
    expect(result.success).toBe(false);
  });
});
