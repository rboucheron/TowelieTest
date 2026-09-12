import type { ProductRepository } from "@/domain/repositories/product-repository";
import {
  type AuthorizationService,
  type AuthorizedActor,
} from "@/domain/services/authorization-service";
import type { Product } from "@/domain/entities/product";
import { type Result, ok, err } from "@/shared/result";
import type { AppError } from "@/shared/errors";

export class ListProductsUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly authorization: AuthorizationService
  ) {}

  async execute(actor: AuthorizedActor, groupId: string): Promise<Result<Product[], AppError>> {
    const access = await this.authorization.requireGroupRole(actor, groupId, "USER");
    if (!access.success) return err(access.error);

    return ok(await this.products.findAllForGroup(groupId));
  }
}
