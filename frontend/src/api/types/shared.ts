import { z } from 'zod'

export const GROUP_ROLES = ['USER', 'QA', 'MAINTAINER', 'ADMIN'] as const
export const GroupRoleSchema = z.enum(GROUP_ROLES)
export type GroupRole = z.infer<typeof GroupRoleSchema>

export const TEST_CASE_PRIORITIES = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
] as const
export const TestCasePrioritySchema = z.enum(TEST_CASE_PRIORITIES)
export type TestCasePriority = z.infer<typeof TestCasePrioritySchema>

export const BUG_PRIORITIES = ['MINOR', 'MAJOR', 'BLOCKING'] as const
export const BugPrioritySchema = z.enum(BUG_PRIORITIES)
export type BugPriority = z.infer<typeof BugPrioritySchema>

export const ROLE_LABELS: Record<GroupRole, string> = {
  USER: 'User',
  QA: 'QA',
  MAINTAINER: 'Maintainer',
  ADMIN: 'Admin',
}
