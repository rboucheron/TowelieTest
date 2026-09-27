import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createBug, listBugs, removeBug, updateBug } from '@/api'
import type { CreateBugInput, UpdateBugInput } from '@/api'
import { queryKeys } from '@/lib/query-keys'

const isGroupBugsQuery = (query: { queryKey: readonly unknown[] }) =>
  query.queryKey[0] === 'groups' && query.queryKey[2] === 'bugs'

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
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.bugs(recipeBookId),
        }),
        queryClient.invalidateQueries({ predicate: isGroupBugsQuery }),
      ])
    },
  })
}

export function useUpdateBugMutation(recipeBookId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bugId, input }: { bugId: string; input: UpdateBugInput }) =>
      updateBug(bugId, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.bugs(recipeBookId),
        }),
        queryClient.invalidateQueries({ predicate: isGroupBugsQuery }),
      ])
    },
  })
}

export function useRemoveBugMutation(recipeBookId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bugId: string) => removeBug(bugId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.bugs(recipeBookId),
        }),
        queryClient.invalidateQueries({ predicate: isGroupBugsQuery }),
      ])
    },
  })
}
