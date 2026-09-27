import { z } from 'zod'
import { GroupRoleSchema } from './shared'

export const LoginInputSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
})
export type LoginInput = z.infer<typeof LoginInputSchema>

export const RegisterInputSchema = z.object({
  email: z.string().email().max(254),
  firstName: z.string().trim().min(1, 'Required').max(100),
  lastName: z.string().trim().min(1, 'Required').max(100),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .max(200),
})
export type RegisterInput = z.infer<typeof RegisterInputSchema>

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
