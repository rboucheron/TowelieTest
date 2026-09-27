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
  CreateBugCommentSchema,
  type CreateBugInput,
  type UpdateBugInput,
  type CreateBugCommentInput,
  type BugDTO,
  type BugDetailDTO,
  type GroupBugDTO,
  type BugCommentDTO,
  type UserSummaryDTO,
} from "@/application/dtos/bug.dto";
import type { BugCommentWithAuthor } from "@/application/use-cases/bugs/list-bug-comments-use-case";
import type { AuthorizedActor } from "@/domain/services/authorization-service";
import type { Bug } from "@/domain/entities/bug";
import type { User } from "@/domain/entities/user";
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

const toUserSummaryDTO = (user: User | null): UserSummaryDTO | null =>
  user ? { id: user.id, firstName: user.firstName, lastName: user.lastName } : null;

const toBugCommentDTO = ({ comment, author }: BugCommentWithAuthor): BugCommentDTO => ({
  id: comment.id,
  bugId: comment.bugId,
  content: comment.content,
  createdAt: comment.createdAt.toISOString(),
  author: toUserSummaryDTO(author),
});

@Controller("groups/:groupId/bugs")
@UseGuards(AuthGuard)
export class GroupBugsController {
  constructor(@Inject(USE_CASES) private readonly useCases: UseCases) {}

  @Get()
  async list(
    @CurrentActor() actor: AuthorizedActor,
    @Param("groupId") groupId: string
  ): Promise<GroupBugDTO[]> {
    const bugs = unwrap(await this.useCases.listGroupBugs.execute(actor, groupId));
    return bugs.map(({ bug, recipeBookTitle }) => ({ ...toBugDTO(bug), recipeBookTitle }));
  }
}

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

  @Get(":bugId")
  async get(
    @CurrentActor() actor: AuthorizedActor,
    @Param("bugId") bugId: string
  ): Promise<BugDetailDTO> {
    const { bug, author } = unwrap(await this.useCases.getBug.execute(actor, bugId));
    return { ...toBugDTO(bug), createdBy: toUserSummaryDTO(author) };
  }

  @Get(":bugId/comments")
  async listComments(
    @CurrentActor() actor: AuthorizedActor,
    @Param("bugId") bugId: string
  ): Promise<BugCommentDTO[]> {
    const comments = unwrap(await this.useCases.listBugComments.execute(actor, bugId));
    return comments.map(toBugCommentDTO);
  }

  @Post(":bugId/comments")
  async createComment(
    @CurrentActor() actor: AuthorizedActor,
    @Param("bugId") bugId: string,
    @Body(new ZodValidationPipe(CreateBugCommentSchema)) input: CreateBugCommentInput
  ): Promise<BugCommentDTO> {
    return toBugCommentDTO(
      unwrap(await this.useCases.createBugComment.execute(actor, bugId, input))
    );
  }

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
