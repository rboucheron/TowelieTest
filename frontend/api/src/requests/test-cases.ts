import { z } from 'zod'
import { apiClient } from '../client'
import {
  TestCaseSchema,
  type CreateTestCaseInput,
  type TestCase,
  type UpdateTestCaseInput,
} from '../types/test-case'

export async function listTestCases(recipeBookId: string): Promise<TestCase[]> {
  const response = await apiClient.get(
    `/v1/recipe-books/${recipeBookId}/test-cases`,
  )
  return z.array(TestCaseSchema).parse(response.data)
}

export async function createTestCase(
  recipeBookId: string,
  input: CreateTestCaseInput,
): Promise<TestCase> {
  const response = await apiClient.post(
    `/v1/recipe-books/${recipeBookId}/test-cases`,
    input,
  )
  return TestCaseSchema.parse(response.data)
}

export async function updateTestCase(
  testCaseId: string,
  input: UpdateTestCaseInput,
): Promise<TestCase> {
  const response = await apiClient.patch(`/v1/test-cases/${testCaseId}`, input)
  return TestCaseSchema.parse(response.data)
}

export async function removeTestCase(testCaseId: string): Promise<void> {
  await apiClient.delete(`/v1/test-cases/${testCaseId}`)
}
