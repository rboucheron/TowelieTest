import { randomBytes, timingSafeEqual } from "node:crypto";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { z } from "zod";
import {
  LoginSchema,
  RegisterSchema,
  type LoginInput,
  type LoginResultDTO,
  type RegisterInput,
} from "@/application/dtos/auth.dto";
import type { MeDTO } from "@/application/use-cases/me/get-me-use-case";
import type { AuthorizedActor } from "@/domain/services/authorization-service";
import type { OAuthProvider } from "@/domain/services/oauth-provider";
import { unauthenticated } from "@/shared/errors";
import { env } from "@/infrastructure/persistence/env";
import { logger } from "@/infrastructure/services/logger";
import { GITHUB_OAUTH, USE_CASES, type UseCases } from "@/interfaces/http/container.module";
import { AuthGuard } from "@/interfaces/http/guards/auth.guard";
import { CurrentActor } from "@/interfaces/http/decorators/current-actor.decorator";
import { ZodValidationPipe } from "@/interfaces/http/pipes/zod-validation.pipe";
import { unwrap } from "@/interfaces/http/unwrap";

const REFRESH_COOKIE = "refresh_token";
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const REFRESH_COOKIE_PATH = "/v1/auth";
const GITHUB_STATE_COOKIE = "github_oauth_state";
const GITHUB_STATE_COOKIE_PATH = "/v1/auth/github";
const GITHUB_STATE_MAX_AGE_MS = 10 * 60 * 1000;

const GithubCallbackQuerySchema = z.object({
  code: z.string().min(1).max(500),
  state: z.string().min(1).max(200),
});

type GithubLoginError = "github_unavailable" | "github_failed" | "github_no_email";

const loginErrorUrl = (error: GithubLoginError): string =>
  `${env.FRONTEND_URL}/login?error=${error}`;

const safeEqual = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
};

const getCookieValue = (req: Request, name: string): string | undefined => {
  // eslint-disable-next-line security/detect-object-injection -- `name` is always our own REFRESH_COOKIE constant, never user input
  const value: unknown = req.cookies[name];
  return typeof value === "string" ? value : undefined;
};

const setRefreshCookie = (res: Response, token: string): void => {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    path: REFRESH_COOKIE_PATH,
  });
};

/** Rate-limited routes (login, refresh, register) are wired in AppModule.configure. */
@Controller("auth")
export class AuthController {
  constructor(
    @Inject(USE_CASES) private readonly useCases: UseCases,
    @Inject(GITHUB_OAUTH) private readonly github: OAuthProvider | null
  ) {}

  @Post("register")
  @HttpCode(201)
  async register(
    @Body(new ZodValidationPipe(RegisterSchema)) input: RegisterInput,
    @Res({ passthrough: true }) res: Response
  ): Promise<LoginResultDTO> {
    const { accessToken, refreshToken, user } = unwrap(await this.useCases.register.execute(input));
    setRefreshCookie(res, refreshToken);
    return { accessToken, user };
  }

  /** Starts the GitHub OAuth flow; the browser navigates here directly (not via XHR). */
  @Get("github")
  githubStart(@Res() res: Response): void {
    if (!this.github) {
      res.redirect(loginErrorUrl("github_unavailable"));
      return;
    }
    const state = randomBytes(32).toString("base64url");
    res.cookie(GITHUB_STATE_COOKIE, state, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: GITHUB_STATE_MAX_AGE_MS,
      path: GITHUB_STATE_COOKIE_PATH,
    });
    res.redirect(this.github.getAuthorizationUrl(state));
  }

  /**
   * GitHub redirects back here. On success we only set the refresh cookie and send the
   * browser to the app, which then obtains its access token through the regular refresh flow.
   */
  @Get("github/callback")
  async githubCallback(
    @Query() query: unknown,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<void> {
    const expectedState = getCookieValue(req, GITHUB_STATE_COOKIE);
    res.clearCookie(GITHUB_STATE_COOKIE, { path: GITHUB_STATE_COOKIE_PATH });

    const loginWithGithub = this.useCases.loginWithGithub;
    if (!loginWithGithub) {
      res.redirect(loginErrorUrl("github_unavailable"));
      return;
    }

    const params = GithubCallbackQuerySchema.safeParse(query);
    if (!params.success || !expectedState || !safeEqual(params.data.state, expectedState)) {
      res.redirect(loginErrorUrl("github_failed"));
      return;
    }

    try {
      const result = await loginWithGithub.execute(params.data.code);
      if (!result.success) {
        res.redirect(
          loginErrorUrl(
            result.error.code === "VALIDATION_ERROR" ? "github_no_email" : "github_failed"
          )
        );
        return;
      }
      setRefreshCookie(res, result.data.refreshToken);
      res.redirect(`${env.FRONTEND_URL}/groups`);
    } catch (error: unknown) {
      logger.error({ err: error }, "GitHub sign-in failed");
      res.redirect(loginErrorUrl("github_failed"));
    }
  }

  @Post("login")
  @HttpCode(200)
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) input: LoginInput,
    @Res({ passthrough: true }) res: Response
  ): Promise<LoginResultDTO> {
    const { accessToken, refreshToken, user } = unwrap(await this.useCases.login.execute(input));
    setRefreshCookie(res, refreshToken);
    return { accessToken, user };
  }

  @Post("refresh")
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ accessToken: string }> {
    const presentedToken = getCookieValue(req, REFRESH_COOKIE);
    if (!presentedToken) throw unauthenticated("No refresh token presented");

    const { accessToken, refreshToken } = unwrap(
      await this.useCases.refreshToken.execute(presentedToken)
    );
    setRefreshCookie(res, refreshToken);
    return { accessToken };
  }

  @Post("logout")
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    const presentedToken = getCookieValue(req, REFRESH_COOKIE);
    if (presentedToken) await this.useCases.logout.execute(presentedToken);
    res.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH });
  }

  @Get("me")
  @UseGuards(AuthGuard)
  async me(@CurrentActor() actor: AuthorizedActor): Promise<MeDTO> {
    return unwrap(await this.useCases.getMe.execute(actor.userId));
  }
}
