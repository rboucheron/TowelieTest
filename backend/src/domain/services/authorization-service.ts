import type { MembershipRepository } from "@/domain/repositories/membership-repository";
import type { Membership } from "@/domain/entities/membership";
import { roleAtLeast, type GroupRole } from "@/domain/value-objects/group-role";
import { forbidden, type AppError } from "@/shared/errors";
import { type Result, ok, err } from "@/shared/result";

export interface AuthorizedActor {
  userId: string;
  isSuperAdmin: boolean;
}

/**
 * Centralizes the "does this actor have at least role X in group Y" check
 * used by every write use-case, so the RBAC hierarchy is enforced in one place.
 */
export class AuthorizationService {
  constructor(private readonly memberships: MembershipRepository) {}

  async requireGroupRole(
    actor: AuthorizedActor,
    groupId: string,
    required: GroupRole
  ): Promise<Result<GroupRole, AppError>> {
    if (actor.isSuperAdmin) return ok("ADMIN");

    const membership = await this.memberships.findByUserAndGroup(actor.userId, groupId);
    if (!membership || !roleAtLeast(membership.role, required)) {
      return err(forbidden(`This action requires the ${required} role or higher in this group`));
    }
    return ok(membership.role);
  }

  async requireGroupMembership(
    actor: AuthorizedActor,
    groupId: string
  ): Promise<Result<Membership | null, AppError>> {
    if (actor.isSuperAdmin) return ok(null);

    const membership = await this.memberships.findByUserAndGroup(actor.userId, groupId);
    if (!membership) return err(forbidden("You are not a member of this group"));
    return ok(membership);
  }

  async requireBugAccess(
    actor: AuthorizedActor,
    groupId: string,
    affectedProductIds: string[]
  ): Promise<Result<void, AppError>> {
    const access = await this.requireGroupMembership(actor, groupId);
    if (!access.success) return err(access.error);

    if (access.data && !access.data.canSeeBugAffecting(affectedProductIds)) {
      return err(forbidden("This bug is outside your product scope"));
    }
    return ok(undefined);
  }
}
