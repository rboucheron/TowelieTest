import { z } from 'zod'

export const ProductSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  name: z.string(),
})
export type Product = z.infer<typeof ProductSchema>

export const CreateProductInputSchema = z.object({
  name: z.string().min(1).max(150),
})
export type CreateProductInput = z.infer<typeof CreateProductInputSchema>

export const UpdateProductInputSchema = z.object({
  name: z.string().min(1).max(150),
})
export type UpdateProductInput = z.infer<typeof UpdateProductInputSchema>
