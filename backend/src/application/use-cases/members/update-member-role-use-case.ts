import type { MembershipRepository } from "@/domain/repositories/membership-repository";
import {
  type AuthorizationService,
  type AuthorizedActor,
} from "@/domain/services/authorization-service";
import { isGroupRole } from "@/domain/value-objects/group-role";
import type { Membership } from "@/domain/entities/membership";
import { type Result, ok, err } from "@/shared/result";
import { notFound, validationError, forbidden, type AppError } from "@/shared/errors";

export class UpdateMemberRoleUseCase {
  constructor(
    private readonly memberships: MembershipRepository,
    private readonly authorization: AuthorizationService
  ) {}

  async execute(
    actor: AuthorizedActor,
    groupId: string,
    targetUserId: string,
    role: string
  ): Promise<Result<Membership, AppError>> {
    const access = await this.authorization.requireGroupRole(actor, groupId, "ADMIN");
    if (!access.success) return err(access.error);

    if (!isGroupRole(role)) return err(validationError(`Invalid role "${role}"`));

    const existing = await this.memberships.findByUserAndGroup(targetUserId, groupId);
    if (!existing) return err(notFound("Membership"));

    if (existing.role === "ADMIN" && role !== "ADMIN" && targetUserId === actor.userId) {
      return err(forbidden("You cannot demote yourself out of the Admin role"));
    }

    return ok(await this.memberships.updateRole(targetUserId, groupId, role));
  }
}
