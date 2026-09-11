import { describe, it, expect, vi } from "vitest";
import { LoginUseCase } from "@/application/use-cases/auth/login-use-case";
import { User } from "@/domain/entities/user";
import type { UserRepository } from "@/domain/repositories/user-repository";
import type { RefreshTokenRepository } from "@/domain/repositories/refresh-token-repository";
import type { PasswordHasher } from "@/domain/services/password-hasher";
import type { TokenService } from "@/domain/services/token-service";

const existingUser = User.reconstitute({
  id: "u1",
  email: "user@example.com",
  passwordHash: "hashed-password",
  firstName: "Jane",
  lastName: "Doe",
  isSuperAdmin: false,
  createdAt: new Date(),
});

interface Deps {
  users: UserRepository;
  refreshTokens: RefreshTokenRepository;
  passwordHasher: PasswordHasher;
  tokenService: TokenService;
}

function buildDeps(userFound: User | null, passwordMatches: boolean): Deps {
  const users: UserRepository = {
    findById: vi.fn(),
    findByEmail: vi.fn().mockResolvedValue(userFound),
    create: vi.fn(),
  };
  const refreshTokens: RefreshTokenRepository = {
    create: vi
      .fn()
      .mockResolvedValue({
        id: "rt1",
        userId: "u1",
        tokenHash: "hash",
        expiresAt: new Date(),
        revokedAt: null,
      }),
    findByHash: vi.fn(),
    revoke: vi.fn(),
  };
  const passwordHasher: PasswordHasher = {
    hash: vi.fn(),
    compare: vi.fn().mockResolvedValue(passwordMatches),
  };
  const tokenService: TokenService = {
    signAccessToken: vi.fn().mockReturnValue("access-token"),
    verifyAccessToken: vi.fn(),
    generateOpaqueToken: vi.fn().mockReturnValue("refresh-token"),
    hashToken: vi.fn().mockReturnValue("hashed-refresh-token"),
  };
  return { users, refreshTokens, passwordHasher, tokenService };
}

describe("LoginUseCase", () => {
  it("returns tokens and user info on a successful login", async () => {
    const deps = buildDeps(existingUser, true);
    const useCase = new LoginUseCase(
      deps.users,
      deps.refreshTokens,
      deps.passwordHasher,
      deps.tokenService
    );

    const result = await useCase.execute({
      email: "user@example.com",
      password: "correct-password",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.accessToken).toBe("access-token");
      expect(result.data.refreshToken).toBe("refresh-token");
      expect(result.data.user.email).toBe("user@example.com");
    }
    expect(deps.refreshTokens.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "u1", tokenHash: "hashed-refresh-token" })
    );
  });

  it("fails with INVALID_CREDENTIALS when the user does not exist", async () => {
    const deps = buildDeps(null, true);
    const useCase = new LoginUseCase(
      deps.users,
      deps.refreshTokens,
      deps.passwordHasher,
      deps.tokenService
    );

    const result = await useCase.execute({ email: "ghost@example.com", password: "whatever" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("fails with INVALID_CREDENTIALS when the password does not match", async () => {
    const deps = buildDeps(existingUser, false);
    const useCase = new LoginUseCase(
      deps.users,
      deps.refreshTokens,
      deps.passwordHasher,
      deps.tokenService
    );

    const result = await useCase.execute({ email: "user@example.com", password: "wrong-password" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("INVALID_CREDENTIALS");
  });
});
