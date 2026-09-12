import { describe, it, expect, vi } from "vitest";
import { CreateGroupUseCase } from "@/application/use-cases/groups/create-group-use-case";
import type { GroupRepository } from "@/domain/repositories/group-repository";
import { type Group } from "@/domain/entities/group";

function buildRepository(): GroupRepository {
  return {
    findById: vi.fn(),
    findAllForUser: vi.fn(),
    findAll: vi.fn(),
    create: vi.fn().mockImplementation(async (group: Group) => Promise.resolve(group)),
    update: vi.fn(),
  };
}

describe("CreateGroupUseCase", () => {
  it("allows a Super-Admin to create a group", async () => {
    const repository = buildRepository();
    const useCase = new CreateGroupUseCase(repository);

    const result = await useCase.execute(
      { userId: "u1", isSuperAdmin: true },
      { name: "QA Squad" }
    );

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("QA Squad");
    expect(repository.create).toHaveBeenCalledOnce();
  });

  it("forbids a non Super-Admin from creating a group", async () => {
    const repository = buildRepository();
    const useCase = new CreateGroupUseCase(repository);

    const result = await useCase.execute(
      { userId: "u1", isSuperAdmin: false },
      { name: "QA Squad" }
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("FORBIDDEN");
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("rejects an empty group name", async () => {
    const repository = buildRepository();
    const useCase = new CreateGroupUseCase(repository);

    const result = await useCase.execute({ userId: "u1", isSuperAdmin: true }, { name: "   " });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("VALIDATION_ERROR");
  });
});
