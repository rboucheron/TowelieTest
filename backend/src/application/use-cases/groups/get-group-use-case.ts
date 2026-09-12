import type { GroupRepository } from "@/domain/repositories/group-repository";
import {
  type AuthorizationService,
  type AuthorizedActor,
} from "@/domain/services/authorization-service";
import type { Group } from "@/domain/entities/group";
import { type Result, ok, err } from "@/shared/result";
import { notFound, type AppError } from "@/shared/errors";

export class GetGroupUseCase {
  constructor(
    private readonly groups: GroupRepository,
    private readonly authorization: AuthorizationService
  ) {}

  async execute(actor: AuthorizedActor, groupId: string): Promise<Result<Group, AppError>> {
    const group = await this.groups.findById(groupId);
    if (!group) return err(notFound("Group"));

    const access = await this.authorization.requireGroupRole(actor, groupId, "USER");
    if (!access.success) return err(access.error);

    return ok(group);
  }
}
