import { z } from 'zod'
import { GroupRoleSchema } from './shared'

export const LoginInputSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
})

export const GithubLoginInputSchema = z.object({
  email: z.string().email().max(254),
  token: z.string().min(1).max(200),
})

export type GithubLoginInput = z.infer<typeof GithubLoginInputSchema>

export type LoginInput = z.infer<typeof LoginInputSchema>

export const AuthenticatedUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  isSuperAdmin: z.boolean(),
})
export type AuthenticatedUser = z.infer<typeof AuthenticatedUserSchema>

export const LoginResultSchema = z.object({
  accessToken: z.string(),
  user: AuthenticatedUserSchema,
})
export type LoginResult = z.infer<typeof LoginResultSchema>

export const RefreshResultSchema = z.object({
  accessToken: z.string(),
})

export const MeMembershipSchema = z.object({
  groupId: z.string(),
  groupName: z.string(),
  role: GroupRoleSchema,
})
export type MeMembership = z.infer<typeof MeMembershipSchema>

export const MeResultSchema = z.object({
  user: AuthenticatedUserSchema,
  memberships: z.array(MeMembershipSchema),
})
export type MeResult = z.infer<typeof MeResultSchema>
