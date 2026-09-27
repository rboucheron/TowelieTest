import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  CreateBugSchema,
  UpdateBugSchema,
  type CreateBugInput,
  type UpdateBugInput,
  type BugDTO,
} from "@/application/dtos/bug.dto";
import type { AuthorizedActor } from "@/domain/services/authorization-service";
import type { Bug } from "@/domain/entities/bug";
import { USE_CASES, type UseCases } from "@/interfaces/http/container.module";
import { AuthGuard } from "@/interfaces/http/guards/auth.guard";
import { CurrentActor } from "@/interfaces/http/decorators/current-actor.decorator";
import { ZodValidationPipe } from "@/interfaces/http/pipes/zod-validation.pipe";
import { unwrap } from "@/interfaces/http/unwrap";

const toBugDTO = (bug: Bug): BugDTO => ({
  id: bug.id,
  recipeBookId: bug.recipeBookId,
  affectedProductIds: bug.affectedProductIds,
  environment: bug.environment,
  problemDescription: bug.problemDescription,
  expectedBehavior: bug.expectedBehavior,
  observedBehavior: bug.observedBehavior,
  stepsToReproduce: bug.stepsToReproduce,
  evidenceAndContext: bug.evidenceAndContext,
  priority: bug.priority,
  createdById: bug.createdById,
  createdAt: bug.createdAt.toISOString(),
});

@Controller("recipe-books/:recipeBookId/bugs")
@UseGuards(AuthGuard)
export class RecipeBookBugsController {
  constructor(@Inject(USE_CASES) private readonly useCases: UseCases) {}

  @Get()
  async list(
    @CurrentActor() actor: AuthorizedActor,
    @Param("recipeBookId") recipeBookId: string
  ): Promise<BugDTO[]> {
    const bugs = unwrap(await this.useCases.listBugs.execute(actor, recipeBookId));
    return bugs.map(toBugDTO);
  }

  @Post()
  async create(
    @CurrentActor() actor: AuthorizedActor,
    @Param("recipeBookId") recipeBookId: string,
    @Body(new ZodValidationPipe(CreateBugSchema)) input: CreateBugInput
  ): Promise<BugDTO> {
    return toBugDTO(unwrap(await this.useCases.createBug.execute(actor, recipeBookId, input)));
  }
}

@Controller("bugs")
@UseGuards(AuthGuard)
export class BugsController {
  constructor(@Inject(USE_CASES) private readonly useCases: UseCases) {}

  @Patch(":bugId")
  async update(
    @CurrentActor() actor: AuthorizedActor,
    @Param("bugId") bugId: string,
    @Body(new ZodValidationPipe(UpdateBugSchema)) input: UpdateBugInput
  ): Promise<BugDTO> {
    return toBugDTO(unwrap(await this.useCases.updateBug.execute(actor, bugId, input)));
  }

  @Delete(":bugId")
  @HttpCode(204)
  async remove(
    @CurrentActor() actor: AuthorizedActor,
    @Param("bugId") bugId: string
  ): Promise<void> {
    unwrap(await this.useCases.removeBug.execute(actor, bugId));
  }
}
