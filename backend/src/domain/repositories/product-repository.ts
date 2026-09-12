import type { Product } from "@/domain/entities/product";

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findAllForGroup(groupId: string): Promise<Product[]>;
  findManyByIds(ids: string[]): Promise<Product[]>;
  create(product: Product): Promise<Product>;
  update(product: Product): Promise<Product>;
  remove(id: string): Promise<void>;
}
