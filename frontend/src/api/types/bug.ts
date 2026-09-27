import { z } from 'zod'
import { BugPrioritySchema } from './shared'

export const BugSchema = z.object({
  id: z.string(),
  recipeBookId: z.string(),
  affectedProductIds: z.array(z.string().uuid()),
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
  affectedProductIds: z.array(z.string().uuid()).min(1).max(50),
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
  affectedProductIds: z.array(z.string().uuid()).min(1).max(50).optional(),
  environment: z.string().min(1).max(100).optional(),
  problemDescription: z.string().min(1).max(5000).optional(),
  expectedBehavior: z.string().min(1).max(2000).optional(),
  observedBehavior: z.string().min(1).max(2000).optional(),
  stepsToReproduce: z.string().min(1).max(5000).optional(),
  evidenceAndContext: z.string().max(5000).optional(),
  priority: BugPrioritySchema.optional(),
})
export type UpdateBugInput = z.infer<typeof UpdateBugInputSchema>

export const UserSummarySchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
})
export type UserSummary = z.infer<typeof UserSummarySchema>

export const BugDetailSchema = BugSchema.extend({
  createdBy: UserSummarySchema.nullable(),
})
export type BugDetail = z.infer<typeof BugDetailSchema>

export const BugCommentSchema = z.object({
  id: z.string(),
  bugId: z.string(),
  content: z.string(),
  createdAt: z.string(),
  author: UserSummarySchema.nullable(),
})
export type BugComment = z.infer<typeof BugCommentSchema>

export const CreateBugCommentInputSchema = z.object({
  content: z.string().trim().min(1, 'Write a comment first').max(5000),
})
export type CreateBugCommentInput = z.infer<typeof CreateBugCommentInputSchema>
