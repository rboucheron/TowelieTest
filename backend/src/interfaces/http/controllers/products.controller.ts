import { Router, type Request, type Response } from "express";
import type { Container } from "@/infrastructure/container";
import {
  CreateProductSchema,
  UpdateProductSchema,
  type ProductDTO,
} from "@/application/dtos/product.dto";
import { asyncHandler } from "@/interfaces/http/middlewares/async-handler";
import { authenticate, requireActor } from "@/interfaces/http/middlewares/authenticate";
import { requireParam } from "@/interfaces/http/middlewares/params";
import { sendAppError } from "@/interfaces/http/middlewares/error-handler";
import type { Product } from "@/domain/entities/product";

const toProductDTO = (product: Product): ProductDTO => ({
  id: product.id,
  groupId: product.groupId,
  name: product.name,
});

/** Mounted at /v1/groups/:groupId/products */
export function createGroupProductsRouter(container: Container): Router {
  const router = Router({ mergeParams: true });
  const { useCases, services } = container;
  router.use(authenticate(services.tokenService));

  router.get(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      const result = await useCases.listProducts.execute(requireActor(req), requireParam(req, "groupId"));
      if (!result.success) { sendAppError(res, result.error); return; }
      res.status(200).json(result.data.map(toProductDTO));
    })
  );

  router.post(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      const input = CreateProductSchema.parse(req.body);
      const result = await useCases.createProduct.execute(
        requireActor(req),
        requireParam(req, "groupId"),
        input
      );
      if (!result.success) { sendAppError(res, result.error); return; }
      res.status(201).json(toProductDTO(result.data));
    })
  );

  return router;
}

/** Mounted at /v1/products/:productId */
export function createProductRouter(container: Container): Router {
  const router = Router();
  const { useCases, services } = container;
  router.use(authenticate(services.tokenService));

  router.patch(
    "/:productId",
    asyncHandler(async (req: Request, res: Response) => {
      const input = UpdateProductSchema.parse(req.body);
      const result = await useCases.updateProduct.execute(
        requireActor(req),
        requireParam(req, "productId"),
        input
      );
      if (!result.success) { sendAppError(res, result.error); return; }
      res.status(200).json(toProductDTO(result.data));
    })
  );

  router.delete(
    "/:productId",
    asyncHandler(async (req: Request, res: Response) => {
      const result = await useCases.removeProduct.execute(
        requireActor(req),
        requireParam(req, "productId")
      );
      if (!result.success) { sendAppError(res, result.error); return; }
      res.status(204).send();
    })
  );

  return router;
}
