import { z } from 'zod'
import { apiClient } from '../client'
import {
  BugSchema,
  type Bug,
  type CreateBugInput,
  type UpdateBugInput,
} from '../types/bug'

export async function listBugs(recipeBookId: string): Promise<Bug[]> {
  const response = await apiClient.get(`/v1/recipe-books/${recipeBookId}/bugs`)
  return z.array(BugSchema).parse(response.data)
}

export async function createBug(
  recipeBookId: string,
  input: CreateBugInput,
): Promise<Bug> {
  const response = await apiClient.post(
    `/v1/recipe-books/${recipeBookId}/bugs`,
    input,
  )
  return BugSchema.parse(response.data)
}

export async function updateBug(
  bugId: string,
  input: UpdateBugInput,
): Promise<Bug> {
  const response = await apiClient.patch(`/v1/bugs/${bugId}`, input)
  return BugSchema.parse(response.data)
}

export async function removeBug(bugId: string): Promise<void> {
  await apiClient.delete(`/v1/bugs/${bugId}`)
}
