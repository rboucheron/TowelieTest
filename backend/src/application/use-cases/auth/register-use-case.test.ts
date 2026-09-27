import { describe, it, expect, vi } from "vitest";
import { RegisterUseCase } from "@/application/use-cases/auth/register-use-case";
import { User } from "@/domain/entities/user";
import type { UserRepository } from "@/domain/repositories/user-repository";
import type { RefreshTokenRepository } from "@/domain/repositories/refresh-token-repository";
import type { PasswordHasher } from "@/domain/services/password-hasher";
import type { TokenService } from "@/domain/services/token-service";

const input = {
  email: "  New.User@Example.com ",
  firstName: "New",
  lastName: "User",
  password: "a-long-enough-password",
};

function buildUseCase(existing: User | null): {
  users: UserRepository;
  refreshTokens: RefreshTokenRepository;
  useCase: RegisterUseCase;
} {
  const users: UserRepository = {
    findById: vi.fn(),
    findManyByIds: vi.fn(),
    findByEmail: vi.fn().mockResolvedValue(existing),
    findByGithubId: vi.fn(),
    linkGithubAccount: vi.fn(),
    create: vi.fn().mockImplementation((user: User) => user),
  };
  const refreshTokens: RefreshTokenRepository = {
    create: vi.fn(),
    findByHash: vi.fn(),
    revoke: vi.fn(),
  };
  const passwordHasher: PasswordHasher = {
    hash: vi.fn().mockResolvedValue("hashed"),
    compare: vi.fn(),
  };
  const tokenService: TokenService = {
    signAccessToken: vi.fn().mockReturnValue("access-token"),
    verifyAccessToken: vi.fn(),
    generateOpaqueToken: vi.fn().mockReturnValue("refresh-token"),
    hashToken: vi.fn().mockReturnValue("hashed-refresh-token"),
  };
  return {
    users,
    refreshTokens,
    useCase: new RegisterUseCase(users, refreshTokens, passwordHasher, tokenService),
  };
}

describe("RegisterUseCase", () => {
  it("creates a non super-admin account with a hashed password and signs it in", async () => {
    const { useCase, users, refreshTokens } = buildUseCase(null);

    const result = await useCase.execute(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.accessToken).toBe("access-token");
      expect(result.data.refreshToken).toBe("refresh-token");
      expect(result.data.user.email).toBe("new.user@example.com");
      expect(result.data.user.isSuperAdmin).toBe(false);
    }
    expect(users.findByEmail).toHaveBeenCalledWith("new.user@example.com");
    const created = vi.mocked(users.create).mock.calls[0]?.[0];
    expect(created?.passwordHash).toBe("hashed");
    expect(refreshTokens.create).toHaveBeenCalledOnce();
  });

  it("fails with ALREADY_EXISTS when the email is taken", async () => {
    const existing = User.reconstitute({
      id: "u1",
      email: "new.user@example.com",
      passwordHash: "x",
      firstName: "A",
      lastName: "B",
      isSuperAdmin: false,
      createdAt: new Date(),
    });
    const { useCase, users } = buildUseCase(existing);

    const result = await useCase.execute(input);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("ALREADY_EXISTS");
    expect(users.create).not.toHaveBeenCalled();
  });
});
