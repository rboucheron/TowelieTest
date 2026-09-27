import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createBugComment, getBug, listBugComments } from '@/api'
import type { CreateBugCommentInput } from '@/api'
import { queryKeys } from '@/lib/query-keys'

export function useBugQuery(bugId: string) {
  return useQuery({
    queryKey: queryKeys.bug(bugId),
    queryFn: () => getBug(bugId),
  })
}

export function useBugCommentsQuery(bugId: string) {
  return useQuery({
    queryKey: queryKeys.bugComments(bugId),
    queryFn: () => listBugComments(bugId),
  })
}

export function useCreateBugCommentMutation(bugId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateBugCommentInput) =>
      createBugComment(bugId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.bugComments(bugId),
      })
    },
  })
}
