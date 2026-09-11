import { z } from 'zod'
import { GroupRoleSchema } from './shared'

export const GroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  logo: z.string().nullable(),
  createdAt: z.string(),
  myRole: GroupRoleSchema.nullable(),
})
export type Group = z.infer<typeof GroupSchema>

export const CreateGroupInputSchema = z.object({
  name: z.string().min(1).max(150),
  logo: z.string().url().optional(),
})
export type CreateGroupInput = z.infer<typeof CreateGroupInputSchema>

export const UpdateGroupInputSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  logo: z.string().url().optional(),
})
export type UpdateGroupInput = z.infer<typeof UpdateGroupInputSchema>

export const MemberSchema = z.object({
  userId: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: GroupRoleSchema,
})
export type Member = z.infer<typeof MemberSchema>

export const CreateMemberInputSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  password: z.string().min(8).max(200),
  role: GroupRoleSchema,
})
export type CreateMemberInput = z.infer<typeof CreateMemberInputSchema>
