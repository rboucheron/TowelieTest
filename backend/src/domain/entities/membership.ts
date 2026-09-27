import type { GroupRole } from "@/domain/value-objects/group-role";

export interface MembershipProps {
  id: string;
  userId: string;
  groupId: string;
  role: GroupRole;
  productIds: string[];
  createdAt: Date;
}

export class Membership {
  private constructor(private readonly props: MembershipProps) {}

  static reconstitute(
    props: Omit<MembershipProps, "productIds"> & { productIds?: string[] }
  ): Membership {
    return new Membership({ ...props, productIds: props.productIds ?? [] });
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

  get productIds(): string[] {
    return this.props.productIds;
  }

  get isDeveloper(): boolean {
    return this.props.role === "DEVELOPER";
  }

  canSeeBugAffecting(affectedProductIds: string[]): boolean {
    if (!this.isDeveloper) return true;
    return affectedProductIds.some((id) => this.props.productIds.includes(id));
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
