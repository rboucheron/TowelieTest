import { z } from "zod";
import { TEST_CASE_PRIORITIES } from "@/domain/value-objects/priority";

const priorityEnum = z.enum(TEST_CASE_PRIORITIES);

export const CreateTestCaseSchema = z.object({
  description: z.string().min(1).max(2000),
  platform: z.string().min(1).max(100),
  steps: z.string().min(1).max(5000),
  expectedResult: z.string().min(1).max(2000),
  priority: priorityEnum.default("MEDIUM"),
});
export type CreateTestCaseInput = z.infer<typeof CreateTestCaseSchema>;

export const UpdateTestCaseSchema = z.object({
  description: z.string().min(1).max(2000).optional(),
  platform: z.string().min(1).max(100).optional(),
  steps: z.string().min(1).max(5000).optional(),
  expectedResult: z.string().min(1).max(2000).optional(),
  priority: priorityEnum.optional(),
});
export type UpdateTestCaseInput = z.infer<typeof UpdateTestCaseSchema>;

export interface TestCaseDTO {
  id: string;
  recipeBookId: string;
  description: string;
  platform: string;
  steps: string;
  expectedResult: string;
  priority: string;
  createdAt: string;
}
