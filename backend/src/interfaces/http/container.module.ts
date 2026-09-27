import { Global, Module } from "@nestjs/common";
import { container, type Container } from "@/infrastructure/container";

/** DI tokens exposing the hand-wired composition root (`infrastructure/container`) to Nest. */
export const USE_CASES = Symbol("USE_CASES");
export const TOKEN_SERVICE = Symbol("TOKEN_SERVICE");
export const GITHUB_OAUTH = Symbol("GITHUB_OAUTH");

export type UseCases = Container["useCases"];

@Global()
@Module({
  providers: [
    { provide: USE_CASES, useValue: container.useCases },
    { provide: TOKEN_SERVICE, useValue: container.services.tokenService },
    { provide: GITHUB_OAUTH, useValue: container.services.githubOAuthProvider },
  ],
  exports: [USE_CASES, TOKEN_SERVICE, GITHUB_OAUTH],
})
export class ContainerModule {}
