import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addMember,
  createGroup,
  getGroup,
  listGroups,
  listMembers,
  removeMember,
  updateGroup,
  updateMemberRole
  
  
  
  
} from '@towelie/api'
import type {CreateGroupInput, CreateMemberInput, GroupRole, UpdateGroupInput} from '@towelie/api';
import { queryKeys } from '@/lib/query-keys'

export function useGroupsQuery() {
  return useQuery({ queryKey: queryKeys.groups, queryFn: listGroups })
}

export function useGroupQuery(groupId: string) {
  return useQuery({
    queryKey: queryKeys.group(groupId),
    queryFn: () => getGroup(groupId),
  })
}

export function useCreateGroupMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateGroupInput) => createGroup(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.groups })
    },
  })
}

export function useUpdateGroupMutation(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateGroupInput) => updateGroup(groupId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.groups })
      await queryClient.invalidateQueries({
        queryKey: queryKeys.group(groupId),
      })
    },
  })
}

export function useMembersQuery(groupId: string) {
  return useQuery({
    queryKey: queryKeys.members(groupId),
    queryFn: () => listMembers(groupId),
  })
}

export function useAddMemberMutation(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateMemberInput) => addMember(groupId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.members(groupId),
      })
    },
  })
}

export function useUpdateMemberRoleMutation(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: GroupRole }) =>
      updateMemberRole(groupId, userId, role),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.members(groupId),
      })
    },
  })
}

export function useRemoveMemberMutation(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => removeMember(groupId, userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.members(groupId),
      })
    },
  })
}
