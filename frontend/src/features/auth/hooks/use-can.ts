import type { GroupRole } from '@/api'
import { useMeQuery } from '@/features/auth/hooks/use-auth'

const ROLE_RANK: Record<GroupRole, number> = {
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
