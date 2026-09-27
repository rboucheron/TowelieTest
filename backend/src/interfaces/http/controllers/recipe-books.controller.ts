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
  CreateRecipeBookSchema,
  UpdateRecipeBookSchema,
  type CreateRecipeBookInput,
  type UpdateRecipeBookInput,
  type RecipeBookDTO,
} from "@/application/dtos/recipe-book.dto";
import type { AuthorizedActor } from "@/domain/services/authorization-service";
import type { RecipeBook } from "@/domain/entities/recipe-book";
import { USE_CASES, type UseCases } from "@/interfaces/http/container.module";
import { AuthGuard } from "@/interfaces/http/guards/auth.guard";
import { CurrentActor } from "@/interfaces/http/decorators/current-actor.decorator";
import { ZodValidationPipe } from "@/interfaces/http/pipes/zod-validation.pipe";
import { unwrap } from "@/interfaces/http/unwrap";

const toRecipeBookDTO = (recipeBook: RecipeBook): RecipeBookDTO => ({
  id: recipeBook.id,
  groupId: recipeBook.groupId,
  title: recipeBook.title,
  description: recipeBook.description,
  logo: recipeBook.logo,
  productIds: recipeBook.productIds,
  createdAt: recipeBook.createdAt.toISOString(),
});

@Controller("groups/:groupId/recipe-books")
@UseGuards(AuthGuard)
export class GroupRecipeBooksController {
  constructor(@Inject(USE_CASES) private readonly useCases: UseCases) {}

  @Get()
  async list(
    @CurrentActor() actor: AuthorizedActor,
    @Param("groupId") groupId: string
  ): Promise<RecipeBookDTO[]> {
    const recipeBooks = unwrap(await this.useCases.listRecipeBooks.execute(actor, groupId));
    return recipeBooks.map(toRecipeBookDTO);
  }

  @Post()
  async create(
    @CurrentActor() actor: AuthorizedActor,
    @Param("groupId") groupId: string,
    @Body(new ZodValidationPipe(CreateRecipeBookSchema)) input: CreateRecipeBookInput
  ): Promise<RecipeBookDTO> {
    return toRecipeBookDTO(
      unwrap(await this.useCases.createRecipeBook.execute(actor, groupId, input))
    );
  }
}

@Controller("recipe-books")
@UseGuards(AuthGuard)
export class RecipeBooksController {
  constructor(@Inject(USE_CASES) private readonly useCases: UseCases) {}

  @Get(":recipeBookId")
  async get(
    @CurrentActor() actor: AuthorizedActor,
    @Param("recipeBookId") recipeBookId: string
  ): Promise<RecipeBookDTO> {
    return toRecipeBookDTO(unwrap(await this.useCases.getRecipeBook.execute(actor, recipeBookId)));
  }

  @Patch(":recipeBookId")
  async update(
    @CurrentActor() actor: AuthorizedActor,
    @Param("recipeBookId") recipeBookId: string,
    @Body(new ZodValidationPipe(UpdateRecipeBookSchema)) input: UpdateRecipeBookInput
  ): Promise<RecipeBookDTO> {
    return toRecipeBookDTO(
      unwrap(await this.useCases.updateRecipeBook.execute(actor, recipeBookId, input))
    );
  }

  @Delete(":recipeBookId")
  @HttpCode(204)
  async remove(
    @CurrentActor() actor: AuthorizedActor,
    @Param("recipeBookId") recipeBookId: string
  ): Promise<void> {
    unwrap(await this.useCases.removeRecipeBook.execute(actor, recipeBookId));
  }
}
