import type { ProductRepository } from "@/domain/repositories/product-repository";
import {
  type AuthorizationService,
  type AuthorizedActor,
} from "@/domain/services/authorization-service";
import { type Result, ok, err } from "@/shared/result";
import { notFound, type AppError } from "@/shared/errors";

export class RemoveProductUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly authorization: AuthorizationService
  ) {}

  async execute(actor: AuthorizedActor, productId: string): Promise<Result<void, AppError>> {
    const existing = await this.products.findById(productId);
    if (!existing) return err(notFound("Product"));

    const access = await this.authorization.requireGroupRole(actor, existing.groupId, "ADMIN");
    if (!access.success) return err(access.error);

    await this.products.remove(productId);
    return ok(undefined);
  }
}
