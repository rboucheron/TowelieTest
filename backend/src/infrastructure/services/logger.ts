import pino from "pino";
import { env } from "@/infrastructure/persistence/env";

export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.body.password",
      "req.body.accessToken",
      "req.body.refreshToken",
      "*.password",
      "*.passwordHash",
    ],
    censor: "[REDACTED]",
  },
});
