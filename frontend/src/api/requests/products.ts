import { z } from 'zod'
import { apiClient } from '../client'
import {
  ProductSchema,
  type CreateProductInput,
  type Product,
  type UpdateProductInput,
} from '../types/product'

export async function listProducts(groupId: string): Promise<Product[]> {
  const response = await apiClient.get(`/v1/groups/${groupId}/products`)
  return z.array(ProductSchema).parse(response.data)
}

export async function createProduct(
  groupId: string,
  input: CreateProductInput,
): Promise<Product> {
  const response = await apiClient.post(`/v1/groups/${groupId}/products`, input)
  return ProductSchema.parse(response.data)
}

export async function updateProduct(
  productId: string,
  input: UpdateProductInput,
): Promise<Product> {
  const response = await apiClient.patch(`/v1/products/${productId}`, input)
  return ProductSchema.parse(response.data)
}

export async function removeProduct(productId: string): Promise<void> {
  await apiClient.delete(`/v1/products/${productId}`)
}
