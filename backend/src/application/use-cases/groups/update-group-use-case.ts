import type { GroupRepository } from "@/domain/repositories/group-repository";
import {
  type AuthorizationService,
  type AuthorizedActor,
} from "@/domain/services/authorization-service";
import { Group } from "@/domain/entities/group";
import type { UpdateGroupInput } from "@/application/dtos/group.dto";
import { type Result, ok, err } from "@/shared/result";
import { notFound, type AppError } from "@/shared/errors";

export class UpdateGroupUseCase {
  constructor(
    private readonly groups: GroupRepository,
    private readonly authorization: AuthorizationService
  ) {}

  async execute(
    actor: AuthorizedActor,
    groupId: string,
    input: UpdateGroupInput
  ): Promise<Result<Group, AppError>> {
    const existing = await this.groups.findById(groupId);
    if (!existing) return err(notFound("Group"));

    const access = await this.authorization.requireGroupRole(actor, groupId, "ADMIN");
    if (!access.success) return err(access.error);

    const groupResult = Group.create({
      id: existing.id,
      name: input.name ?? existing.name,
      logo: input.logo ?? existing.logo,
      createdAt: existing.createdAt,
    });
    if (!groupResult.success) return err(groupResult.error);

    return ok(await this.groups.update(groupResult.data));
  }
}
