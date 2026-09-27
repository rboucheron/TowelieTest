import { z } from 'zod'
import { apiClient } from '../client'
import { BugCommentSchema, BugDetailSchema, BugSchema } from '../types/bug'
import type {
  Bug,
  BugComment,
  BugDetail,
  CreateBugCommentInput,
  CreateBugInput,
  UpdateBugInput,
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

export async function getBug(bugId: string): Promise<BugDetail> {
  const response = await apiClient.get(`/v1/bugs/${bugId}`)
  return BugDetailSchema.parse(response.data)
}

export async function listBugComments(bugId: string): Promise<BugComment[]> {
  const response = await apiClient.get(`/v1/bugs/${bugId}/comments`)
  return z.array(BugCommentSchema).parse(response.data)
}

export async function createBugComment(
  bugId: string,
  input: CreateBugCommentInput,
): Promise<BugComment> {
  const response = await apiClient.post(`/v1/bugs/${bugId}/comments`, input)
  return BugCommentSchema.parse(response.data)
}
