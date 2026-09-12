import { randomUUID } from "node:crypto";
import type { GroupRepository } from "@/domain/repositories/group-repository";
import { Group } from "@/domain/entities/group";
import type { CreateGroupInput } from "@/application/dtos/group.dto";
import { type Result, ok, err } from "@/shared/result";
import { forbidden, type AppError } from "@/shared/errors";
import type { AuthorizedActor } from "@/domain/services/authorization-service";

export class CreateGroupUseCase {
  constructor(private readonly groups: GroupRepository) {}

  async execute(actor: AuthorizedActor, input: CreateGroupInput): Promise<Result<Group, AppError>> {
    if (!actor.isSuperAdmin) {
      return err(forbidden("Only a platform Super-Admin can create a Group"));
    }

    const groupResult = Group.create({
      id: randomUUID(),
      name: input.name,
      logo: input.logo ?? null,
      createdAt: new Date(),
    });
    if (!groupResult.success) return err(groupResult.error);

    return ok(await this.groups.create(groupResult.data));
  }
}
