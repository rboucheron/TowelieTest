import type { PrismaClient, Product as PrismaProduct } from "@prisma/client";
import type { ProductRepository } from "@/domain/repositories/product-repository";
import { Product } from "@/domain/entities/product";

const toDomain = (record: PrismaProduct): Product =>
  Product.reconstitute({ id: record.id, groupId: record.groupId, name: record.name });

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Product | null> {
    const record = await this.prisma.product.findUnique({ where: { id } });
    return record ? toDomain(record) : null;
  }

  async findAllForGroup(groupId: string): Promise<Product[]> {
    const records = await this.prisma.product.findMany({
      where: { groupId },
      orderBy: { name: "asc" },
    });
    return records.map(toDomain);
  }

  async findManyByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];
    const records = await this.prisma.product.findMany({ where: { id: { in: ids } } });
    return records.map(toDomain);
  }

  async create(product: Product): Promise<Product> {
    const record = await this.prisma.product.create({
      data: { id: product.id, groupId: product.groupId, name: product.name },
    });
    return toDomain(record);
  }

  async update(product: Product): Promise<Product> {
    const record = await this.prisma.product.update({
      where: { id: product.id },
      data: { name: product.name },
    });
    return toDomain(record);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }
}
