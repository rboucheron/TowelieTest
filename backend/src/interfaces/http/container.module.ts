import { Global, Module } from "@nestjs/common";
import { container, type Container } from "@/infrastructure/container";

/** DI tokens exposing the hand-wired composition root (`infrastructure/container`) to Nest. */
export const USE_CASES = Symbol("USE_CASES");
export const TOKEN_SERVICE = Symbol("TOKEN_SERVICE");

export type UseCases = Container["useCases"];

@Global()
@Module({
  providers: [
    { provide: USE_CASES, useValue: container.useCases },
    { provide: TOKEN_SERVICE, useValue: container.services.tokenService },
  ],
  exports: [USE_CASES, TOKEN_SERVICE],
})
export class ContainerModule {}
