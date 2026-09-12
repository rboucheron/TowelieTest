import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createRecipeBook,
  getRecipeBook,
  listRecipeBooks,
  removeRecipeBook,
  updateRecipeBook
  
  
} from '@/api'
import type {CreateRecipeBookInput, UpdateRecipeBookInput} from '@/api';
import { queryKeys } from '@/lib/query-keys'

export function useRecipeBooksQuery(groupId: string) {
  return useQuery({
    queryKey: queryKeys.recipeBooks(groupId),
    queryFn: () => listRecipeBooks(groupId),
  })
}

export function useRecipeBookQuery(recipeBookId: string) {
  return useQuery({
    queryKey: queryKeys.recipeBook(recipeBookId),
    queryFn: () => getRecipeBook(recipeBookId),
  })
}

export function useCreateRecipeBookMutation(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateRecipeBookInput) =>
      createRecipeBook(groupId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.recipeBooks(groupId),
      })
    },
  })
}

export function useUpdateRecipeBookMutation(
  groupId: string,
  recipeBookId: string,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateRecipeBookInput) =>
      updateRecipeBook(recipeBookId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.recipeBooks(groupId),
      })
      await queryClient.invalidateQueries({
        queryKey: queryKeys.recipeBook(recipeBookId),
      })
    },
  })
}

export function useRemoveRecipeBookMutation(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (recipeBookId: string) => removeRecipeBook(recipeBookId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.recipeBooks(groupId),
      })
    },
  })
}
