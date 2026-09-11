import { z } from 'zod'
import { BugPrioritySchema } from './shared'

export const BugSchema = z.object({
  id: z.string(),
  recipeBookId: z.string(),
  affectedProductIds: z.array(z.string()),
  environment: z.string(),
  problemDescription: z.string(),
  expectedBehavior: z.string(),
  observedBehavior: z.string(),
  stepsToReproduce: z.string(),
  evidenceAndContext: z.string(),
  priority: BugPrioritySchema,
  createdById: z.string(),
  createdAt: z.string(),
})
export type Bug = z.infer<typeof BugSchema>

export const CreateBugInputSchema = z.object({
  affectedProductIds: z.array(z.string()).min(1),
  environment: z.string().min(1).max(100),
  problemDescription: z.string().min(1).max(5000),
  expectedBehavior: z.string().min(1).max(2000),
  observedBehavior: z.string().min(1).max(2000),
  stepsToReproduce: z.string().min(1).max(5000),
  evidenceAndContext: z.string().max(5000).default(''),
  priority: BugPrioritySchema.default('MINOR'),
})
export type CreateBugInput = z.infer<typeof CreateBugInputSchema>

export const UpdateBugInputSchema = z.object({
  affectedProductIds: z.array(z.string()).min(1).optional(),
  environment: z.string().min(1).max(100).optional(),
  problemDescription: z.string().min(1).max(5000).optional(),
  expectedBehavior: z.string().min(1).max(2000).optional(),
  observedBehavior: z.string().min(1).max(2000).optional(),
  stepsToReproduce: z.string().min(1).max(5000).optional(),
  evidenceAndContext: z.string().max(5000).optional(),
  priority: BugPrioritySchema.optional(),
})
export type UpdateBugInput = z.infer<typeof UpdateBugInputSchema>
