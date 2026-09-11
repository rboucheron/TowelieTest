import type {
  MembershipRepository,
  MembershipWithUser,
} from "@/domain/repositories/membership-repository";
import {
  type AuthorizationService,
  type AuthorizedActor,
} from "@/domain/services/authorization-service";
import { type Result, ok, err } from "@/shared/result";
import type { AppError } from "@/shared/errors";

export class ListMembersUseCase {
  constructor(
    private readonly memberships: MembershipRepository,
    private readonly authorization: AuthorizationService
  ) {}

  async execute(
    actor: AuthorizedActor,
    groupId: string
  ): Promise<Result<MembershipWithUser[], AppError>> {
    const access = await this.authorization.requireGroupRole(actor, groupId, "USER");
    if (!access.success) return err(access.error);

    return ok(await this.memberships.findAllForGroup(groupId));
  }
}
