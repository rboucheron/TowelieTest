import { describe, it, expect, vi } from "vitest";
import { LoginWithGithubUseCase } from "@/application/use-cases/auth/login-with-github-use-case";
import { User } from "@/domain/entities/user";
import type { UserRepository } from "@/domain/repositories/user-repository";
import type { RefreshTokenRepository } from "@/domain/repositories/refresh-token-repository";
import type { TokenService } from "@/domain/services/token-service";
import type { OAuthProfile, OAuthProvider } from "@/domain/services/oauth-provider";

const profile: OAuthProfile = {
  providerUserId: "42",
  verifiedEmail: "Octo@Example.com",
  firstName: "Octo",
  lastName: "Cat",
};

const makeUser = (
  overrides: Partial<{ githubId: string | null; passwordHash: string | null }>
): User =>
  User.reconstitute({
    id: "u1",
    email: "octo@example.com",
    passwordHash: "hashed",
    githubId: null,
    firstName: "Octo",
    lastName: "Cat",
    isSuperAdmin: false,
    createdAt: new Date(),
    ...overrides,
  });

function buildUseCase(opts: {
  profile: OAuthProfile | null;
  byGithubId?: User | null;
  byEmail?: User | null;
}): { users: UserRepository; useCase: LoginWithGithubUseCase } {
  const users: UserRepository = {
    findById: vi.fn(),
    findByEmail: vi.fn().mockResolvedValue(opts.byEmail ?? null),
    findByGithubId: vi.fn().mockResolvedValue(opts.byGithubId ?? null),
    linkGithubAccount: vi.fn().mockResolvedValue(makeUser({ githubId: "42" })),
    create: vi.fn().mockImplementation((user: User) => user),
  };
  const refreshTokens: RefreshTokenRepository = {
    create: vi.fn(),
    findByHash: vi.fn(),
    revoke: vi.fn(),
  };
  const tokenService: TokenService = {
    signAccessToken: vi.fn().mockReturnValue("access-token"),
    verifyAccessToken: vi.fn(),
    generateOpaqueToken: vi.fn().mockReturnValue("refresh-token"),
    hashToken: vi.fn().mockReturnValue("hashed-refresh-token"),
  };
  const github: OAuthProvider = {
    getAuthorizationUrl: vi.fn(),
    fetchProfile: vi.fn().mockResolvedValue(opts.profile),
  };
  return {
    users,
    useCase: new LoginWithGithubUseCase(users, refreshTokens, tokenService, github),
  };
}

describe("LoginWithGithubUseCase", () => {
  it("signs in a user already linked to the GitHub account", async () => {
    const linked = makeUser({ githubId: "42" });
    const { useCase, users } = buildUseCase({ profile, byGithubId: linked });

    const result = await useCase.execute("code");

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.user.id).toBe("u1");
    expect(users.create).not.toHaveBeenCalled();
    expect(users.linkGithubAccount).not.toHaveBeenCalled();
  });

  it("links GitHub to an existing account with the same verified email", async () => {
    const { useCase, users } = buildUseCase({ profile, byEmail: makeUser({}) });

    const result = await useCase.execute("code");

    expect(result.success).toBe(true);
    expect(users.findByEmail).toHaveBeenCalledWith("octo@example.com");
    expect(users.linkGithubAccount).toHaveBeenCalledWith("u1", "42");
    expect(users.create).not.toHaveBeenCalled();
  });

  it("creates a password-less account on first GitHub sign-in", async () => {
    const { useCase, users } = buildUseCase({ profile });

    const result = await useCase.execute("code");

    expect(result.success).toBe(true);
    const created = vi.mocked(users.create).mock.calls[0]?.[0];
    expect(created?.email).toBe("octo@example.com");
    expect(created?.githubId).toBe("42");
    expect(created?.passwordHash).toBeNull();
    expect(created?.isSuperAdmin).toBe(false);
  });

  it("refuses to create or link an account without a verified email", async () => {
    const { useCase, users } = buildUseCase({ profile: { ...profile, verifiedEmail: null } });

    const result = await useCase.execute("code");

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("VALIDATION_ERROR");
    expect(users.findByEmail).not.toHaveBeenCalled();
    expect(users.create).not.toHaveBeenCalled();
  });

  it("fails with UNAUTHENTICATED when GitHub rejects the code", async () => {
    const { useCase } = buildUseCase({ profile: null });

    const result = await useCase.execute("bad-code");

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("UNAUTHENTICATED");
  });
});
