import { z } from "zod";
import type { OAuthProfile, OAuthProvider } from "@/domain/services/oauth-provider";
import { logger } from "@/infrastructure/services/logger";

const AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const TOKEN_URL = "https://github.com/login/oauth/access_token";
const API_URL = "https://api.github.com";
const SCOPES = "read:user user:email";
const NAME_MAX_LENGTH = 100;

const TokenResponseSchema = z.object({ access_token: z.string().min(1) });
const UserResponseSchema = z.object({
  id: z.number(),
  login: z.string(),
  name: z.string().nullable(),
});
const EmailsResponseSchema = z.array(
  z.object({ email: z.string(), primary: z.boolean(), verified: z.boolean() })
);

export interface GithubOAuthConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
}

const splitName = (name: string | null, login: string): { firstName: string; lastName: string } => {
  const [first, ...rest] = (name ?? "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: (first ?? login).slice(0, NAME_MAX_LENGTH),
    lastName: (rest.join(" ") || login).slice(0, NAME_MAX_LENGTH),
  };
};

export class GithubOAuthProvider implements OAuthProvider {
  constructor(private readonly config: GithubOAuthConfig) {}

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.callbackUrl,
      scope: SCOPES,
      state,
      allow_signup: "true",
    });
    return `${AUTHORIZE_URL}?${params.toString()}`;
  }

  async fetchProfile(code: string): Promise<OAuthProfile | null> {
    const accessToken = await this.exchangeCode(code);
    if (!accessToken) return null;

    const [userBody, emailsBody] = await Promise.all([
      this.getJson("/user", accessToken),
      this.getJson("/user/emails", accessToken),
    ]);
    const user = UserResponseSchema.safeParse(userBody);
    const emails = EmailsResponseSchema.safeParse(emailsBody);
    if (!user.success || !emails.success) {
      logger.warn("Unexpected GitHub user/emails response shape");
      return null;
    }

    const primary = emails.data.find((e) => e.primary && e.verified);
    return {
      providerUserId: String(user.data.id),
      verifiedEmail: primary?.email ?? null,
      ...splitName(user.data.name, user.data.login),
    };
  }

  private async exchangeCode(code: string): Promise<string | null> {
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: this.config.callbackUrl,
      }),
    });
    // GitHub answers 200 with an `error` field for bad codes, so the schema check covers both cases.
    const parsed = TokenResponseSchema.safeParse(await response.json().catch(() => null));
    return parsed.success ? parsed.data.access_token : null;
  }

  private async getJson(path: string, accessToken: string): Promise<unknown> {
    const response = await fetch(`${API_URL}${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      logger.warn(
        { path, status: response.status, body: body.slice(0, 300) },
        "GitHub API request failed"
      );
      return null;
    }
    return response.json();
  }
}
