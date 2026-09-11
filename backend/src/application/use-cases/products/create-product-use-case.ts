import { randomUUID } from "node:crypto";
import type { ProductRepository } from "@/domain/repositories/product-repository";
import {
  type AuthorizationService,
  type AuthorizedActor,
} from "@/domain/services/authorization-service";
import { Product } from "@/domain/entities/product";
import type { CreateProductInput } from "@/application/dtos/product.dto";
import { type Result, ok, err } from "@/shared/result";
import type { AppError } from "@/shared/errors";

export class CreateProductUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly authorization: AuthorizationService
  ) {}

  async execute(
    actor: AuthorizedActor,
    groupId: string,
    input: CreateProductInput
  ): Promise<Result<Product, AppError>> {
    const access = await this.authorization.requireGroupRole(actor, groupId, "ADMIN");
    if (!access.success) return err(access.error);

    const productResult = Product.create({ id: randomUUID(), groupId, name: input.name });
    if (!productResult.success) return err(productResult.error);

    return ok(await this.products.create(productResult.data));
  }
}
