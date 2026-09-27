import type { MembershipRepository } from "@/domain/repositories/membership-repository";
import type { ProductRepository } from "@/domain/repositories/product-repository";
import {
  type AuthorizationService,
  type AuthorizedActor,
} from "@/domain/services/authorization-service";
import type { Membership } from "@/domain/entities/membership";
import type { SetMemberProductsInput } from "@/application/dtos/group.dto";
import { type Result, ok, err } from "@/shared/result";
import { notFound, validationError, type AppError } from "@/shared/errors";

export class SetMemberProductsUseCase {
  constructor(
    private readonly memberships: MembershipRepository,
    private readonly products: ProductRepository,
    private readonly authorization: AuthorizationService
  ) {}

  async execute(
    actor: AuthorizedActor,
    groupId: string,
    targetUserId: string,
    input: SetMemberProductsInput
  ): Promise<Result<Membership, AppError>> {
    const access = await this.authorization.requireGroupRole(actor, groupId, "ADMIN");
    if (!access.success) return err(access.error);

    const existing = await this.memberships.findByUserAndGroup(targetUserId, groupId);
    if (!existing) return err(notFound("Membership"));
    if (!existing.isDeveloper) {
      return err(validationError("Only developers can be scoped to products"));
    }

    const productIds = [...new Set(input.productIds)];
    const products = await this.products.findManyByIds(productIds);
    if (products.length !== productIds.length || products.some((p) => p.groupId !== groupId)) {
      return err(validationError("One or more products do not belong to this group"));
    }

    return ok(await this.memberships.setProducts(existing.id, productIds));
  }
}
