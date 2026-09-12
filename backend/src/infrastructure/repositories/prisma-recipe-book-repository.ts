import type { PrismaClient, RecipeBook as PrismaRecipeBook } from "@prisma/client";
import type { RecipeBookRepository } from "@/domain/repositories/recipe-book-repository";
import { RecipeBook } from "@/domain/entities/recipe-book";

type RecipeBookWithProducts = PrismaRecipeBook & { products: { productId: string }[] };

const toDomain = (record: RecipeBookWithProducts): RecipeBook =>
  RecipeBook.reconstitute({
    id: record.id,
    groupId: record.groupId,
    title: record.title,
    description: record.description,
    logo: record.logo,
    productIds: record.products.map((p) => p.productId),
    createdAt: record.createdAt,
  });

const includeProducts = { products: { select: { productId: true } } } as const;

export class PrismaRecipeBookRepository implements RecipeBookRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<RecipeBook | null> {
    const record = await this.prisma.recipeBook.findUnique({
      where: { id },
      include: includeProducts,
    });
    return record ? toDomain(record) : null;
  }

  async findAllForGroup(groupId: string): Promise<RecipeBook[]> {
    const records = await this.prisma.recipeBook.findMany({
      where: { groupId },
      include: includeProducts,
      orderBy: { createdAt: "desc" },
    });
    return records.map(toDomain);
  }

  async create(recipeBook: RecipeBook): Promise<RecipeBook> {
    const record = await this.prisma.recipeBook.create({
      data: {
        id: recipeBook.id,
        groupId: recipeBook.groupId,
        title: recipeBook.title,
        description: recipeBook.description,
        logo: recipeBook.logo,
        createdAt: recipeBook.createdAt,
        products: { create: recipeBook.productIds.map((productId) => ({ productId })) },
      },
      include: includeProducts,
    });
    return toDomain(record);
  }

  async update(recipeBook: RecipeBook): Promise<RecipeBook> {
    const record = await this.prisma.$transaction(async (tx) => {
      await tx.recipeBookProduct.deleteMany({ where: { recipeBookId: recipeBook.id } });
      return tx.recipeBook.update({
        where: { id: recipeBook.id },
        data: {
          title: recipeBook.title,
          description: recipeBook.description,
          logo: recipeBook.logo,
          products: { create: recipeBook.productIds.map((productId) => ({ productId })) },
        },
        include: includeProducts,
      });
    });
    return toDomain(record);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.recipeBook.delete({ where: { id } });
  }
}
