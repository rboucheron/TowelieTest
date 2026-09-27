import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import type { AuthorizedActor } from "@/domain/services/authorization-service";
import type { MeDTO } from "@/application/use-cases/me/get-me-use-case";
import { USE_CASES, type UseCases } from "@/interfaces/http/container.module";
import { AuthGuard } from "@/interfaces/http/guards/auth.guard";
import { CurrentActor } from "@/interfaces/http/decorators/current-actor.decorator";
import { unwrap } from "@/interfaces/http/unwrap";

@Controller("me")
@UseGuards(AuthGuard)
export class MeController {
  constructor(@Inject(USE_CASES) private readonly useCases: UseCases) {}

  @Get()
  async getMe(@CurrentActor() actor: AuthorizedActor): Promise<MeDTO> {
    return unwrap(await this.useCases.getMe.execute(actor.userId));
  }
}
