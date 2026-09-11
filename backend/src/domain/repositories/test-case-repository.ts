import type { TestCase } from "@/domain/entities/test-case";

export interface TestCaseRepository {
  findById(id: string): Promise<TestCase | null>;
  findAllForRecipeBook(recipeBookId: string): Promise<TestCase[]>;
  create(testCase: TestCase): Promise<TestCase>;
  update(testCase: TestCase): Promise<TestCase>;
  remove(id: string): Promise<void>;
}
