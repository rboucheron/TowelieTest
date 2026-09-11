import type { PrismaClient, Bug as PrismaBug } from "@prisma/client";
import type { BugRepository } from "@/domain/repositories/bug-repository";
import { Bug } from "@/domain/entities/bug";

type BugWithProducts = PrismaBug & { affectedProducts: { productId: string }[] };

const toDomain = (record: BugWithProducts): Bug =>
  Bug.reconstitute({
    id: record.id,
    recipeBookId: record.recipeBookId,
    affectedProductIds: record.affectedProducts.map((p) => p.productId),
    environment: record.environment,
    problemDescription: record.problemDescription,
    expectedBehavior: record.expectedBehavior,
    observedBehavior: record.observedBehavior,
    stepsToReproduce: record.stepsToReproduce,
    evidenceAndContext: record.evidenceAndContext,
    priority: record.priority,
    createdById: record.createdById,
    createdAt: record.createdAt,
  });

const includeProducts = { affectedProducts: { select: { productId: true } } } as const;

export class PrismaBugRepository implements BugRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Bug | null> {
    const record = await this.prisma.bug.findUnique({ where: { id }, include: includeProducts });
    return record ? toDomain(record) : null;
  }

  async findAllForRecipeBook(recipeBookId: string): Promise<Bug[]> {
    const records = await this.prisma.bug.findMany({
      where: { recipeBookId },
      include: includeProducts,
      orderBy: { createdAt: "desc" },
    });
    return records.map(toDomain);
  }

  async create(bug: Bug): Promise<Bug> {
    const record = await this.prisma.bug.create({
      data: {
        id: bug.id,
        recipeBookId: bug.recipeBookId,
        environment: bug.environment,
        problemDescription: bug.problemDescription,
        expectedBehavior: bug.expectedBehavior,
        observedBehavior: bug.observedBehavior,
        stepsToReproduce: bug.stepsToReproduce,
        evidenceAndContext: bug.evidenceAndContext,
        priority: bug.priority,
        createdById: bug.createdById,
        createdAt: bug.createdAt,
        affectedProducts: { create: bug.affectedProductIds.map((productId) => ({ productId })) },
      },
      include: includeProducts,
    });
    return toDomain(record);
  }

  async update(bug: Bug): Promise<Bug> {
    const record = await this.prisma.$transaction(async (tx) => {
      await tx.bugAffectedProduct.deleteMany({ where: { bugId: bug.id } });
      return tx.bug.update({
        where: { id: bug.id },
        data: {
          environment: bug.environment,
          problemDescription: bug.problemDescription,
          expectedBehavior: bug.expectedBehavior,
          observedBehavior: bug.observedBehavior,
          stepsToReproduce: bug.stepsToReproduce,
          evidenceAndContext: bug.evidenceAndContext,
          priority: bug.priority,
          affectedProducts: { create: bug.affectedProductIds.map((productId) => ({ productId })) },
        },
        include: includeProducts,
      });
    });
    return toDomain(record);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.bug.delete({ where: { id } });
  }
}
