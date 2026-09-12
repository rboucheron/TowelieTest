import type { GroupRole } from "@/domain/value-objects/group-role";

export interface MembershipProps {
  id: string;
  userId: string;
  groupId: string;
  role: GroupRole;
  createdAt: Date;
}

export class Membership {
  private constructor(private readonly props: MembershipProps) {}

  static reconstitute(props: MembershipProps): Membership {
    return new Membership(props);
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get groupId(): string {
    return this.props.groupId;
  }

  get role(): GroupRole {
    return this.props.role;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
