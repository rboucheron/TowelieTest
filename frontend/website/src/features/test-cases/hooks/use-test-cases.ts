import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTestCase,
  listTestCases,
  removeTestCase,
  updateTestCase
  
  
} from '@towelie/api'
import type {CreateTestCaseInput, UpdateTestCaseInput} from '@towelie/api';
import { queryKeys } from '@/lib/query-keys'

export function useTestCasesQuery(recipeBookId: string) {
  return useQuery({
    queryKey: queryKeys.testCases(recipeBookId),
    queryFn: () => listTestCases(recipeBookId),
  })
}

export function useCreateTestCaseMutation(recipeBookId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTestCaseInput) =>
      createTestCase(recipeBookId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.testCases(recipeBookId),
      })
    },
  })
}

export function useUpdateTestCaseMutation(recipeBookId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      testCaseId,
      input,
    }: {
      testCaseId: string
      input: UpdateTestCaseInput
    }) => updateTestCase(testCaseId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.testCases(recipeBookId),
      })
    },
  })
}

export function useRemoveTestCaseMutation(recipeBookId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (testCaseId: string) => removeTestCase(testCaseId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.testCases(recipeBookId),
      })
    },
  })
}
