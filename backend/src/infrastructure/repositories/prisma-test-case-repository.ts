import type { PrismaClient, TestCase as PrismaTestCase } from "@prisma/client";
import type { TestCaseRepository } from "@/domain/repositories/test-case-repository";
import { TestCase } from "@/domain/entities/test-case";

const toDomain = (record: PrismaTestCase): TestCase =>
  TestCase.reconstitute({
    id: record.id,
    recipeBookId: record.recipeBookId,
    description: record.description,
    platform: record.platform,
    steps: record.steps,
    expectedResult: record.expectedResult,
    priority: record.priority,
    createdAt: record.createdAt,
  });

export class PrismaTestCaseRepository implements TestCaseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<TestCase | null> {
    const record = await this.prisma.testCase.findUnique({ where: { id } });
    return record ? toDomain(record) : null;
  }

  async findAllForRecipeBook(recipeBookId: string): Promise<TestCase[]> {
    const records = await this.prisma.testCase.findMany({
      where: { recipeBookId },
      orderBy: { createdAt: "desc" },
    });
    return records.map(toDomain);
  }

  async create(testCase: TestCase): Promise<TestCase> {
    const record = await this.prisma.testCase.create({
      data: {
        id: testCase.id,
        recipeBookId: testCase.recipeBookId,
        description: testCase.description,
        platform: testCase.platform,
        steps: testCase.steps,
        expectedResult: testCase.expectedResult,
        priority: testCase.priority,
        createdAt: testCase.createdAt,
      },
    });
    return toDomain(record);
  }

  async update(testCase: TestCase): Promise<TestCase> {
    const record = await this.prisma.testCase.update({
      where: { id: testCase.id },
      data: {
        description: testCase.description,
        platform: testCase.platform,
        steps: testCase.steps,
        expectedResult: testCase.expectedResult,
        priority: testCase.priority,
      },
    });
    return toDomain(record);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.testCase.delete({ where: { id } });
  }
}
