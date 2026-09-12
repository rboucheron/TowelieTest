import type { PrismaClient, Group as PrismaGroup } from "@prisma/client";
import type { GroupRepository } from "@/domain/repositories/group-repository";
import { Group } from "@/domain/entities/group";

const toDomain = (record: PrismaGroup): Group =>
  Group.reconstitute({
    id: record.id,
    name: record.name,
    logo: record.logo,
    createdAt: record.createdAt,
  });

export class PrismaGroupRepository implements GroupRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Group | null> {
    const record = await this.prisma.group.findUnique({ where: { id } });
    return record ? toDomain(record) : null;
  }

  async findAllForUser(userId: string): Promise<Group[]> {
    const records = await this.prisma.group.findMany({
      where: { memberships: { some: { userId } } },
      orderBy: { createdAt: "desc" },
    });
    return records.map(toDomain);
  }

  async findAll(): Promise<Group[]> {
    const records = await this.prisma.group.findMany({ orderBy: { createdAt: "desc" } });
    return records.map(toDomain);
  }

  async create(group: Group): Promise<Group> {
    const record = await this.prisma.group.create({
      data: { id: group.id, name: group.name, logo: group.logo, createdAt: group.createdAt },
    });
    return toDomain(record);
  }

  async update(group: Group): Promise<Group> {
    const record = await this.prisma.group.update({
      where: { id: group.id },
      data: { name: group.name, logo: group.logo },
    });
    return toDomain(record);
  }
}
