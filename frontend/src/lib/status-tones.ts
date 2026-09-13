import type { BugPriority, GroupRole, TestCasePriority } from '@/api'
import type { StatusTone } from '@/components/StatusBadge'

export const TEST_CASE_PRIORITY_TONE: Record<TestCasePriority, StatusTone> = {
  LOW: 'success',
  MEDIUM: 'neutral',
  HIGH: 'warning',
  CRITICAL: 'danger',
}

export const BUG_PRIORITY_TONE: Record<BugPriority, StatusTone> = {
  MINOR: 'success',
  MAJOR: 'warning',
  BLOCKING: 'danger',
}

export const ROLE_TONE: Record<GroupRole, StatusTone> = {
  USER: 'neutral',
  QA: 'success',
  MAINTAINER: 'warning',
  ADMIN: 'danger',
}
