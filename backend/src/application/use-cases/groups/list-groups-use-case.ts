import type { GroupRepository } from "@/domain/repositories/group-repository";
import type { MembershipRepository } from "@/domain/repositories/membership-repository";
import type { Group } from "@/domain/entities/group";
import type { AuthorizedActor } from "@/domain/services/authorization-service";

export interface GroupWithRole {
  group: Group;
  myRole: string | null;
}

export class ListGroupsUseCase {
  constructor(
    private readonly groups: GroupRepository,
    private readonly memberships: MembershipRepository
  ) {}

  async execute(actor: AuthorizedActor): Promise<GroupWithRole[]> {
    if (actor.isSuperAdmin) {
      const allGroups = await this.groups.findAll();
      const myMemberships = await this.memberships.findAllForUser(actor.userId);
      const roleByGroupId = new Map(myMemberships.map((m) => [m.groupId, m.role]));
      return allGroups.map((group) => ({ group, myRole: roleByGroupId.get(group.id) ?? null }));
    }

    const myGroups = await this.groups.findAllForUser(actor.userId);
    const myMemberships = await this.memberships.findAllForUser(actor.userId);
    const roleByGroupId = new Map(myMemberships.map((m) => [m.groupId, m.role]));
    return myGroups.map((group) => ({ group, myRole: roleByGroupId.get(group.id) ?? null }));
  }
}
