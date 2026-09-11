import type { GroupRole } from '@towelie/api'
import { useMeQuery } from '@/features/auth/hooks/use-auth'

const ROLE_RANK: Record<GroupRole, number> = {
  USER: 0,
  QA: 1,
  MAINTAINER: 2,
  ADMIN: 3,
}

/**
 * Client-side RBAC gate for hiding/disabling actions. This is defense-in-depth only —
 * the backend re-checks every write, so a hidden button here is a UX nicety, not security.
 */
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
