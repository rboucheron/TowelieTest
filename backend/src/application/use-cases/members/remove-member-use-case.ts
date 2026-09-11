import type { MembershipRepository } from "@/domain/repositories/membership-repository";
import {
  type AuthorizationService,
  type AuthorizedActor,
} from "@/domain/services/authorization-service";
import { type Result, ok, err } from "@/shared/result";
import { notFound, forbidden, type AppError } from "@/shared/errors";

export class RemoveMemberUseCase {
  constructor(
    private readonly memberships: MembershipRepository,
    private readonly authorization: AuthorizationService
  ) {}

  async execute(
    actor: AuthorizedActor,
    groupId: string,
    targetUserId: string
  ): Promise<Result<void, AppError>> {
    const access = await this.authorization.requireGroupRole(actor, groupId, "ADMIN");
    if (!access.success) return err(access.error);

    if (targetUserId === actor.userId) {
      return err(forbidden("You cannot remove yourself from the group"));
    }

    const existing = await this.memberships.findByUserAndGroup(targetUserId, groupId);
    if (!existing) return err(notFound("Membership"));

    await this.memberships.remove(targetUserId, groupId);
    return ok(undefined);
  }
}
