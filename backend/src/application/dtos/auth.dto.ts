import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: z.string().email().max(254),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  password: z.string().min(12).max(200),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export interface AuthenticatedUserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isSuperAdmin: boolean;
}

export interface LoginResultDTO {
  accessToken: string;
  user: AuthenticatedUserDTO;
}
