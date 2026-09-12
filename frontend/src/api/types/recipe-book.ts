import { z } from 'zod'

export const RecipeBookSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  title: z.string(),
  description: z.string(),
  logo: z.string().nullable(),
  productIds: z.array(z.string().uuid()),
  createdAt: z.string(),
})
export type RecipeBook = z.infer<typeof RecipeBookSchema>

export const CreateRecipeBookInputSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).default(''),
  logo: z.string().url().max(2000).optional(),
  productIds: z.array(z.string().uuid()).max(50).default([]),
})
export type CreateRecipeBookInput = z.infer<typeof CreateRecipeBookInputSchema>

export const UpdateRecipeBookInputSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  logo: z.string().url().max(2000).optional(),
  productIds: z.array(z.string().uuid()).max(50).optional(),
})
export type UpdateRecipeBookInput = z.infer<typeof UpdateRecipeBookInputSchema>
