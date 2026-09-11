import type { Membership } from "@/domain/entities/membership";
import type { GroupRole } from "@/domain/value-objects/group-role";

export interface MembershipWithUser {
  membership: Membership;
  user: { id: string; email: string; firstName: string; lastName: string };
}

export interface CreateMembershipInput {
  userId: string;
  groupId: string;
  role: GroupRole;
}

export interface MembershipRepository {
  findByUserAndGroup(userId: string, groupId: string): Promise<Membership | null>;
  findAllForGroup(groupId: string): Promise<MembershipWithUser[]>;
  findAllForUser(userId: string): Promise<Membership[]>;
  create(input: CreateMembershipInput): Promise<Membership>;
  updateRole(userId: string, groupId: string, role: GroupRole): Promise<Membership>;
  remove(userId: string, groupId: string): Promise<void>;
}
