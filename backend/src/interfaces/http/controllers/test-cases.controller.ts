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
  CreateTestCaseSchema,
  UpdateTestCaseSchema,
  type CreateTestCaseInput,
  type UpdateTestCaseInput,
  type TestCaseDTO,
} from "@/application/dtos/test-case.dto";
import type { AuthorizedActor } from "@/domain/services/authorization-service";
import type { TestCase } from "@/domain/entities/test-case";
import { USE_CASES, type UseCases } from "@/interfaces/http/container.module";
import { AuthGuard } from "@/interfaces/http/guards/auth.guard";
import { CurrentActor } from "@/interfaces/http/decorators/current-actor.decorator";
import { ZodValidationPipe } from "@/interfaces/http/pipes/zod-validation.pipe";
import { unwrap } from "@/interfaces/http/unwrap";

const toTestCaseDTO = (testCase: TestCase): TestCaseDTO => ({
  id: testCase.id,
  recipeBookId: testCase.recipeBookId,
  description: testCase.description,
  platform: testCase.platform,
  steps: testCase.steps,
  expectedResult: testCase.expectedResult,
  priority: testCase.priority,
  createdAt: testCase.createdAt.toISOString(),
});

@Controller("recipe-books/:recipeBookId/test-cases")
@UseGuards(AuthGuard)
export class RecipeBookTestCasesController {
  constructor(@Inject(USE_CASES) private readonly useCases: UseCases) {}

  @Get()
  async list(
    @CurrentActor() actor: AuthorizedActor,
    @Param("recipeBookId") recipeBookId: string
  ): Promise<TestCaseDTO[]> {
    const testCases = unwrap(await this.useCases.listTestCases.execute(actor, recipeBookId));
    return testCases.map(toTestCaseDTO);
  }

  @Post()
  async create(
    @CurrentActor() actor: AuthorizedActor,
    @Param("recipeBookId") recipeBookId: string,
    @Body(new ZodValidationPipe(CreateTestCaseSchema)) input: CreateTestCaseInput
  ): Promise<TestCaseDTO> {
    return toTestCaseDTO(
      unwrap(await this.useCases.createTestCase.execute(actor, recipeBookId, input))
    );
  }
}

@Controller("test-cases")
@UseGuards(AuthGuard)
export class TestCasesController {
  constructor(@Inject(USE_CASES) private readonly useCases: UseCases) {}

  @Patch(":testCaseId")
  async update(
    @CurrentActor() actor: AuthorizedActor,
    @Param("testCaseId") testCaseId: string,
    @Body(new ZodValidationPipe(UpdateTestCaseSchema)) input: UpdateTestCaseInput
  ): Promise<TestCaseDTO> {
    return toTestCaseDTO(
      unwrap(await this.useCases.updateTestCase.execute(actor, testCaseId, input))
    );
  }

  @Delete(":testCaseId")
  @HttpCode(204)
  async remove(
    @CurrentActor() actor: AuthorizedActor,
    @Param("testCaseId") testCaseId: string
  ): Promise<void> {
    unwrap(await this.useCases.removeTestCase.execute(actor, testCaseId));
  }
}
