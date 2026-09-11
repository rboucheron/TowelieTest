import { z } from "zod";
import { GROUP_ROLES } from "@/domain/value-objects/group-role";

export const CreateGroupSchema = z.object({
  name: z.string().min(1).max(150),
  logo: z.string().url().max(2000).optional(),
});
export type CreateGroupInput = z.infer<typeof CreateGroupSchema>;

export const UpdateGroupSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  logo: z.string().url().max(2000).optional(),
});
export type UpdateGroupInput = z.infer<typeof UpdateGroupSchema>;

export const CreateMemberSchema = z.object({
  email: z.string().email().max(254),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  password: z.string().min(8).max(200),
  role: z.enum(GROUP_ROLES),
});
export type CreateMemberInput = z.infer<typeof CreateMemberSchema>;

export const UpdateMemberRoleSchema = z.object({
  role: z.enum(GROUP_ROLES),
});
export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleSchema>;

export interface GroupDTO {
  id: string;
  name: string;
  logo: string | null;
  createdAt: string;
  myRole: string | null;
}

export interface MemberDTO {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}
