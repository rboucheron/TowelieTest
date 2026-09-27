import type { GroupRole } from '@/api'
import { useMeQuery } from '@/features/auth/hooks/use-auth'

const ROLE_RANK: Record<GroupRole, number> = {
  DEVELOPER: -1,
  USER: 0,
  QA: 1,
  MAINTAINER: 2,
  ADMIN: 3,
}

export function useCan(
  groupId: string | undefined,
  required: GroupRole,
): boolean {
  const meQuery = useMeQuery()
  if (!meQuery.data || !groupId) return false
  if (meQuery.data.user.isSuperAdmin) return true

  const membership = meQuery.data.memberships.find((m) => m.groupId === groupId)
  if (!membership) return false

  return ROLE_RANK[membership.role] >= ROLE_RANK[required]
}

export function useIsDeveloper(groupId: string | undefined): boolean {
  const meQuery = useMeQuery()
  if (!meQuery.data || !groupId || meQuery.data.user.isSuperAdmin) return false
  return (
    meQuery.data.memberships.find((m) => m.groupId === groupId)?.role ===
    'DEVELOPER'
  )
}
