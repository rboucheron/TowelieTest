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
  CreateProductSchema,
  UpdateProductSchema,
  type CreateProductInput,
  type UpdateProductInput,
  type ProductDTO,
} from "@/application/dtos/product.dto";
import type { AuthorizedActor } from "@/domain/services/authorization-service";
import type { Product } from "@/domain/entities/product";
import { USE_CASES, type UseCases } from "@/interfaces/http/container.module";
import { AuthGuard } from "@/interfaces/http/guards/auth.guard";
import { CurrentActor } from "@/interfaces/http/decorators/current-actor.decorator";
import { ZodValidationPipe } from "@/interfaces/http/pipes/zod-validation.pipe";
import { unwrap } from "@/interfaces/http/unwrap";

const toProductDTO = (product: Product): ProductDTO => ({
  id: product.id,
  groupId: product.groupId,
  name: product.name,
});

@Controller("groups/:groupId/products")
@UseGuards(AuthGuard)
export class GroupProductsController {
  constructor(@Inject(USE_CASES) private readonly useCases: UseCases) {}

  @Get()
  async list(
    @CurrentActor() actor: AuthorizedActor,
    @Param("groupId") groupId: string
  ): Promise<ProductDTO[]> {
    const products = unwrap(await this.useCases.listProducts.execute(actor, groupId));
    return products.map(toProductDTO);
  }

  @Post()
  async create(
    @CurrentActor() actor: AuthorizedActor,
    @Param("groupId") groupId: string,
    @Body(new ZodValidationPipe(CreateProductSchema)) input: CreateProductInput
  ): Promise<ProductDTO> {
    return toProductDTO(unwrap(await this.useCases.createProduct.execute(actor, groupId, input)));
  }
}

@Controller("products")
@UseGuards(AuthGuard)
export class ProductsController {
  constructor(@Inject(USE_CASES) private readonly useCases: UseCases) {}

  @Patch(":productId")
  async update(
    @CurrentActor() actor: AuthorizedActor,
    @Param("productId") productId: string,
    @Body(new ZodValidationPipe(UpdateProductSchema)) input: UpdateProductInput
  ): Promise<ProductDTO> {
    return toProductDTO(unwrap(await this.useCases.updateProduct.execute(actor, productId, input)));
  }

  @Delete(":productId")
  @HttpCode(204)
  async remove(
    @CurrentActor() actor: AuthorizedActor,
    @Param("productId") productId: string
  ): Promise<void> {
    unwrap(await this.useCases.removeProduct.execute(actor, productId));
  }
}
