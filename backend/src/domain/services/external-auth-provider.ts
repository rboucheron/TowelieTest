export type ExternalAuthProviderName = "github" | "google";

export interface ExternalUser {
  providerId: string;
  email: string | null;
  firstName: string;
  lastName: string;
}

export interface ExternalAuthProvider {
  authenticate(accessToken: string): Promise<ExternalUser>;
}