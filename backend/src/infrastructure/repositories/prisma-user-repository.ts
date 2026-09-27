import type { PrismaClient, User as PrismaUser } from "@prisma/client";
import type { UserRepository } from "@/domain/repositories/user-repository";
import { User } from "@/domain/entities/user";

const toDomain = (record: PrismaUser): User =>
  User.reconstitute({
    id: record.id,
    email: record.email,
    passwordHash: record.passwordHash,
    githubId: record.githubId,
    firstName: record.firstName,
    lastName: record.lastName,
    isSuperAdmin: record.isSuperAdmin,
    createdAt: record.createdAt,
  });

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? toDomain(record) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { email } });
    return record ? toDomain(record) : null;
  }

  async findByGithubId(githubId: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { githubId } });
    return record ? toDomain(record) : null;
  }

  async linkGithubAccount(userId: string, githubId: string): Promise<User> {
    const record = await this.prisma.user.update({ where: { id: userId }, data: { githubId } });
    return toDomain(record);
  }

  async create(user: User): Promise<User> {
    const record = await this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        githubId: user.githubId,
        firstName: user.firstName,
        lastName: user.lastName,
        isSuperAdmin: user.isSuperAdmin,
        createdAt: user.createdAt,
      },
    });
    return toDomain(record);
  }
}
