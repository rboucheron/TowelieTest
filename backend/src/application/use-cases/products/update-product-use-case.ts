import type { ProductRepository } from "@/domain/repositories/product-repository";
import {
  type AuthorizationService,
  type AuthorizedActor,
} from "@/domain/services/authorization-service";
import { Product } from "@/domain/entities/product";
import type { UpdateProductInput } from "@/application/dtos/product.dto";
import { type Result, ok, err } from "@/shared/result";
import { notFound, type AppError } from "@/shared/errors";

export class UpdateProductUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly authorization: AuthorizationService
  ) {}

  async execute(
    actor: AuthorizedActor,
    productId: string,
    input: UpdateProductInput
  ): Promise<Result<Product, AppError>> {
    const existing = await this.products.findById(productId);
    if (!existing) return err(notFound("Product"));

    const access = await this.authorization.requireGroupRole(actor, existing.groupId, "ADMIN");
    if (!access.success) return err(access.error);

    const productResult = Product.create({
      id: existing.id,
      groupId: existing.groupId,
      name: input.name,
    });
    if (!productResult.success) return err(productResult.error);

    return ok(await this.products.update(productResult.data));
  }
}
