import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z.string().min(1).max(150),
});
export type CreateProductInput = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = z.object({
  name: z.string().min(1).max(150),
});
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

export interface ProductDTO {
  id: string;
  groupId: string;
  name: string;
}
