import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMe, login, logout, register } from '@/api'
import type { LoginInput, RegisterInput } from '@/api'
import { queryKeys } from '@/lib/query-keys'

export function useMeQuery() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
    retry: false,
  })
}

export function useLoginMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.me })
    },
  })
}

export function useRegisterMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.me })
    },
  })
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.me, undefined)
      queryClient.clear()
    },
  })
}
