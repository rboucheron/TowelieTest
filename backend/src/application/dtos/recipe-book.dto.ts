import { z } from "zod";

export const CreateRecipeBookSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).default(""),
  logo: z.string().url().max(2000).optional(),
  productIds: z.array(z.string().uuid()).max(50).default([]),
});
export type CreateRecipeBookInput = z.infer<typeof CreateRecipeBookSchema>;

export const UpdateRecipeBookSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  logo: z.string().url().max(2000).optional(),
  productIds: z.array(z.string().uuid()).max(50).optional(),
});
export type UpdateRecipeBookInput = z.infer<typeof UpdateRecipeBookSchema>;

export interface RecipeBookDTO {
  id: string;
  groupId: string;
  title: string;
  description: string;
  logo: string | null;
  productIds: string[];
  createdAt: string;
}
