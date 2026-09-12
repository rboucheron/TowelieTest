import { z } from 'zod'
import { apiClient } from '../client'
import {
  RecipeBookSchema,
  type CreateRecipeBookInput,
  type RecipeBook,
  type UpdateRecipeBookInput,
} from '../types/recipe-book'

export async function listRecipeBooks(groupId: string): Promise<RecipeBook[]> {
  const response = await apiClient.get(`/v1/groups/${groupId}/recipe-books`)
  return z.array(RecipeBookSchema).parse(response.data)
}

export async function getRecipeBook(recipeBookId: string): Promise<RecipeBook> {
  const response = await apiClient.get(`/v1/recipe-books/${recipeBookId}`)
  return RecipeBookSchema.parse(response.data)
}

export async function createRecipeBook(
  groupId: string,
  input: CreateRecipeBookInput,
): Promise<RecipeBook> {
  const response = await apiClient.post(
    `/v1/groups/${groupId}/recipe-books`,
    input,
  )
  return RecipeBookSchema.parse(response.data)
}

export async function updateRecipeBook(
  recipeBookId: string,
  input: UpdateRecipeBookInput,
): Promise<RecipeBook> {
  const response = await apiClient.patch(
    `/v1/recipe-books/${recipeBookId}`,
    input,
  )
  return RecipeBookSchema.parse(response.data)
}

export async function removeRecipeBook(recipeBookId: string): Promise<void> {
  await apiClient.delete(`/v1/recipe-books/${recipeBookId}`)
}
