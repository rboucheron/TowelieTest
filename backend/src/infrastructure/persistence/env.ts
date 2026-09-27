import { z } from "zod";

const optionalSecret = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional()
);

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8000),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  CORS_ALLOW_ORIGIN: z.string().min(1),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  GITHUB_CLIENT_ID: optionalSecret,
  GITHUB_CLIENT_SECRET: optionalSecret,
  GITHUB_CALLBACK_URL: z.string().url().default("http://localhost:8000/v1/auth/github/callback"),
});

export const env = EnvSchema.parse(process.env);
