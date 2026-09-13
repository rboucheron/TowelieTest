import type { UserRepository } from "@/domain/repositories/user-repository";
import type { RefreshTokenRepository } from "@/domain/repositories/refresh-token-repository";
import type { PasswordHasher } from "@/domain/services/password-hasher";
import type { TokenService } from "@/domain/services/token-service";
import type {
  AuthenticatedUserDTO,
  ExternalAuthInput,
  LoginResultDTO,
} from "@/application/dtos/auth.dto";
import type {
  ExternalAuthProvider,
  ExternalAuthProviderName,
} from "@/domain/services/external-auth-provider";
import { type Result, ok, err } from "@/shared/result";
import { invalidCredentials, type AppError } from "@/shared/errors";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export class ExternalLoginUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly tokenService: TokenService,
    private readonly externalAuthProviders: Partial<
      Record<ExternalAuthProviderName, ExternalAuthProvider>
    >
  ) {}

  async execute(
    input: ExternalAuthInput,
    externalService: ExternalAuthProviderName
  ): Promise<Result<LoginResultDTO & { refreshToken: string }, AppError>> {
    const user = await this.users.findByEmail(input.email.trim().toLowerCase());

    this.authenticateExternalUser(externalService, input.token);

    if (!user) return err(invalidCredentials());


    const accessToken = this.tokenService.signAccessToken({
      sub: user.id,
      isSuperAdmin: user.isSuperAdmin,
    });

    const refreshToken = this.tokenService.generateOpaqueToken();
    await this.refreshTokens.create({
      userId: user.id,
      tokenHash: this.tokenService.hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });

    return ok({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isSuperAdmin: user.isSuperAdmin,
      },
    });
  }

  private async authenticateExternalUser(
    externalService: ExternalAuthProviderName,
    externalToken: string
  ): Promise<Result<AuthenticatedUserDTO, AppError>> {
    const provider = this.externalAuthProviders[externalService];
    if (!provider) return err(invalidCredentials());

    try {
      const externalUser = await provider.authenticate(externalToken);
      if (!externalUser.email) return err(invalidCredentials());

      const user = await this.users.findByEmail(externalUser.email.trim().toLowerCase());
      if (!user) return err(invalidCredentials());

      return ok({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isSuperAdmin: user.isSuperAdmin,
      });
    } catch {
      return err(invalidCredentials());
    }
  }
}
