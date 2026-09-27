export interface OAuthProfile {
  /** Stable identifier of the account at the provider (never the login/username, which can change). */
  providerUserId: string;
  /** Primary email, only set when the provider has verified it. */
  verifiedEmail: string | null;
  firstName: string;
  lastName: string;
}

export interface OAuthProvider {
  /** Returns the provider's consent-screen URL, carrying `state` for CSRF protection. */
  getAuthorizationUrl(state: string): string;
  /** Exchanges the authorization code for the signed-in account's profile, or null if rejected. */
  fetchProfile(code: string): Promise<OAuthProfile | null>;
}
