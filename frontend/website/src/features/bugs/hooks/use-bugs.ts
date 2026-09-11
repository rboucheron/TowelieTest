import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createBug,
  listBugs,
  removeBug,
  updateBug
  
  
} from '@towelie/api'
import type {CreateBugInput, UpdateBugInput} from '@towelie/api';
import { queryKeys } from '@/lib/query-keys'

export function useBugsQuery(recipeBookId: string) {
  return useQuery({
    queryKey: queryKeys.bugs(recipeBookId),
    queryFn: () => listBugs(recipeBookId),
  })
}

export function useCreateBugMutation(recipeBookId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateBugInput) => createBug(recipeBookId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.bugs(recipeBookId),
      })
    },
  })
}

export function useUpdateBugMutation(recipeBookId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bugId, input }: { bugId: string; input: UpdateBugInput }) =>
      updateBug(bugId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.bugs(recipeBookId),
      })
    },
  })
}

export function useRemoveBugMutation(recipeBookId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bugId: string) => removeBug(bugId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.bugs(recipeBookId),
      })
    },
  })
}
