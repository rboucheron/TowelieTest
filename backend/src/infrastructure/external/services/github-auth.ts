
import { AxiosHttpClient } from "@/infrastructure/services/axios-http-client";
import type {
  ExternalAuthProvider,
  ExternalUser,
} from "@/domain/services/external-auth-provider";

const GITHUB_USER_URL = "https://api.github.com/user";
const GITHUB_API_VERSION = "application/vnd.github.v3+json";

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

export class GitHubAuth implements ExternalAuthProvider {
  constructor(private readonly httpClient = new AxiosHttpClient()) {}

  async authenticate(accessToken: string): Promise<ExternalUser> {
    const user = await this.getUser(accessToken);
    const nameParts = (user.name ?? user.login).trim().split(/\s+/);
    const firstName = nameParts[0] ?? user.login;
    const lastNameParts = nameParts.slice(1);

    return {
      providerId: String(user.id),
      email: user.email,
      firstName,
      lastName: lastNameParts.join(" ") || firstName,
    };
  }

  async getUser(accessToken: string): Promise<GitHubUser> {
    try {
      const response = await this.httpClient.get<GitHubUser>(GITHUB_USER_URL, {
        headers: {
          Accept: GITHUB_API_VERSION,
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      throw new Error("Failed to authenticate with GitHub", { cause: error });
    }
  }
}