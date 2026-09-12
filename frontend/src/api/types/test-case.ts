import { z } from 'zod'
import { TestCasePrioritySchema } from './shared'

export const TestCaseSchema = z.object({
  id: z.string(),
  recipeBookId: z.string(),
  description: z.string(),
  platform: z.string(),
  steps: z.string(),
  expectedResult: z.string(),
  priority: TestCasePrioritySchema,
  createdAt: z.string(),
})
export type TestCase = z.infer<typeof TestCaseSchema>

export const CreateTestCaseInputSchema = z.object({
  description: z.string().min(1).max(2000),
  platform: z.string().min(1).max(100),
  steps: z.string().min(1).max(5000),
  expectedResult: z.string().min(1).max(2000),
  priority: TestCasePrioritySchema.default('MEDIUM'),
})
export type CreateTestCaseInput = z.infer<typeof CreateTestCaseInputSchema>

export const UpdateTestCaseInputSchema = z.object({
  description: z.string().min(1).max(2000).optional(),
  platform: z.string().min(1).max(100).optional(),
  steps: z.string().min(1).max(5000).optional(),
  expectedResult: z.string().min(1).max(2000).optional(),
  priority: TestCasePrioritySchema.optional(),
})
export type UpdateTestCaseInput = z.infer<typeof UpdateTestCaseInputSchema>
