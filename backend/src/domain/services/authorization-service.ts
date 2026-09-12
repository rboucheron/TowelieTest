import type { MembershipRepository } from "@/domain/repositories/membership-repository";
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
}
