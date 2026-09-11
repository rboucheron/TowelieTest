import { z } from 'zod'
import { apiClient } from '../client'
import {
  GroupSchema,
  MemberSchema,
  type CreateGroupInput,
  type CreateMemberInput,
  type Group,
  type Member,
  type UpdateGroupInput,
} from '../types/group'
import type { GroupRole } from '../types/shared'

export async function listGroups(): Promise<Group[]> {
  const response = await apiClient.get('/v1/groups')
  return z.array(GroupSchema).parse(response.data)
}

export async function getGroup(groupId: string): Promise<Group> {
  const response = await apiClient.get(`/v1/groups/${groupId}`)
  return GroupSchema.parse(response.data)
}

export async function createGroup(input: CreateGroupInput): Promise<Group> {
  const response = await apiClient.post('/v1/groups', input)
  return GroupSchema.parse(response.data)
}

export async function updateGroup(
  groupId: string,
  input: UpdateGroupInput,
): Promise<Group> {
  const response = await apiClient.patch(`/v1/groups/${groupId}`, input)
  return GroupSchema.parse(response.data)
}

export async function listMembers(groupId: string): Promise<Member[]> {
  const response = await apiClient.get(`/v1/groups/${groupId}/members`)
  return z.array(MemberSchema).parse(response.data)
}

export async function addMember(
  groupId: string,
  input: CreateMemberInput,
): Promise<void> {
  await apiClient.post(`/v1/groups/${groupId}/members`, input)
}

export async function updateMemberRole(
  groupId: string,
  userId: string,
  role: GroupRole,
): Promise<void> {
  await apiClient.patch(`/v1/groups/${groupId}/members/${userId}`, { role })
}

export async function removeMember(
  groupId: string,
  userId: string,
): Promise<void> {
  await apiClient.delete(`/v1/groups/${groupId}/members/${userId}`)
}
