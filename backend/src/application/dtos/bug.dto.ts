import { z } from "zod";
import { BUG_PRIORITIES } from "@/domain/value-objects/priority";

const priorityEnum = z.enum(BUG_PRIORITIES);

export const CreateBugSchema = z.object({
  affectedProductIds: z.array(z.string().uuid()).min(1).max(50),
  environment: z.string().min(1).max(100),
  problemDescription: z.string().min(1).max(5000),
  expectedBehavior: z.string().min(1).max(2000),
  observedBehavior: z.string().min(1).max(2000),
  stepsToReproduce: z.string().min(1).max(5000),
  evidenceAndContext: z.string().max(5000).default(""),
  priority: priorityEnum.default("MINOR"),
});
export type CreateBugInput = z.infer<typeof CreateBugSchema>;

export const UpdateBugSchema = z.object({
  affectedProductIds: z.array(z.string().uuid()).min(1).max(50).optional(),
  environment: z.string().min(1).max(100).optional(),
  problemDescription: z.string().min(1).max(5000).optional(),
  expectedBehavior: z.string().min(1).max(2000).optional(),
  observedBehavior: z.string().min(1).max(2000).optional(),
  stepsToReproduce: z.string().min(1).max(5000).optional(),
  evidenceAndContext: z.string().max(5000).optional(),
  priority: priorityEnum.optional(),
});
export type UpdateBugInput = z.infer<typeof UpdateBugSchema>;

export interface BugDTO {
  id: string;
  recipeBookId: string;
  affectedProductIds: string[];
  environment: string;
  problemDescription: string;
  expectedBehavior: string;
  observedBehavior: string;
  stepsToReproduce: string;
  evidenceAndContext: string;
  priority: string;
  createdById: string;
  createdAt: string;
}

export interface UserSummaryDTO {
  id: string;
  firstName: string;
  lastName: string;
}

export interface GroupBugDTO extends BugDTO {
  recipeBookTitle: string | null;
}

export interface BugDetailDTO extends BugDTO {
  createdBy: UserSummaryDTO | null;
}

export const CreateBugCommentSchema = z.object({
  content: z.string().trim().min(1).max(5000),
});
export type CreateBugCommentInput = z.infer<typeof CreateBugCommentSchema>;

export interface BugCommentDTO {
  id: string;
  bugId: string;
  content: string;
  createdAt: string;
  author: UserSummaryDTO | null;
}
