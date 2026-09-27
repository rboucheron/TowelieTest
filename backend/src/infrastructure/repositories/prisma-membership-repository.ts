import type { PrismaClient, Membership as PrismaMembership } from "@prisma/client";
import type {
  MembershipRepository,
  MembershipWithUser,
  CreateMembershipInput,
} from "@/domain/repositories/membership-repository";
import { Membership } from "@/domain/entities/membership";
import type { GroupRole } from "@/domain/value-objects/group-role";

type MembershipWithProducts = PrismaMembership & { products: { productId: string }[] };

const includeProducts = { products: { select: { productId: true } } } as const;

const toDomain = (record: MembershipWithProducts): Membership =>
  Membership.reconstitute({
    id: record.id,
    userId: record.userId,
    groupId: record.groupId,
    role: record.role,
    productIds: record.products.map((p) => p.productId),
    createdAt: record.createdAt,
  });

export class PrismaMembershipRepository implements MembershipRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserAndGroup(userId: string, groupId: string): Promise<Membership | null> {
    const record = await this.prisma.membership.findUnique({
      where: { userId_groupId: { userId, groupId } },
      include: includeProducts,
    });
    return record ? toDomain(record) : null;
  }

  async findAllForGroup(groupId: string): Promise<MembershipWithUser[]> {
    const records = await this.prisma.membership.findMany({
      where: { groupId },
      include: { user: true, ...includeProducts },
      orderBy: { createdAt: "asc" },
    });
    return records.map((record) => ({
      membership: toDomain(record),
      user: {
        id: record.user.id,
        email: record.user.email,
        firstName: record.user.firstName,
        lastName: record.user.lastName,
      },
    }));
  }

  async findAllForUser(userId: string): Promise<Membership[]> {
    const records = await this.prisma.membership.findMany({
      where: { userId },
      include: includeProducts,
    });
    return records.map(toDomain);
  }

  async create(input: CreateMembershipInput): Promise<Membership> {
    const record = await this.prisma.membership.create({
      data: {
        userId: input.userId,
        groupId: input.groupId,
        role: input.role,
        products: { create: (input.productIds ?? []).map((productId) => ({ productId })) },
      },
      include: includeProducts,
    });
    return toDomain(record);
  }

  async updateRole(userId: string, groupId: string, role: GroupRole): Promise<Membership> {
    const record = await this.prisma.membership.update({
      where: { userId_groupId: { userId, groupId } },
      data: { role },
      include: includeProducts,
    });
    return toDomain(record);
  }

  async setProducts(membershipId: string, productIds: string[]): Promise<Membership> {
    const record = await this.prisma.$transaction(async (tx) => {
      await tx.membershipProduct.deleteMany({ where: { membershipId } });
      return tx.membership.update({
        where: { id: membershipId },
        data: { products: { create: productIds.map((productId) => ({ productId })) } },
        include: includeProducts,
      });
    });
    return toDomain(record);
  }

  async remove(userId: string, groupId: string): Promise<void> {
    await this.prisma.membership.delete({ where: { userId_groupId: { userId, groupId } } });
  }
}
