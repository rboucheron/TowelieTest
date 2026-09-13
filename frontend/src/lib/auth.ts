import GitHub from "@auth/core/providers/github";
import type { StartAuthJSConfig } from "start-authjs";

export const authConfig: StartAuthJSConfig = {
  secret: process.env.AUTH_SECRET,

  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
};