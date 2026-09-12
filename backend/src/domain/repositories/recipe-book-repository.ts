import type { RecipeBook } from "@/domain/entities/recipe-book";

export interface RecipeBookRepository {
  findById(id: string): Promise<RecipeBook | null>;
  findAllForGroup(groupId: string): Promise<RecipeBook[]>;
  create(recipeBook: RecipeBook): Promise<RecipeBook>;
  update(recipeBook: RecipeBook): Promise<RecipeBook>;
  remove(id: string): Promise<void>;
}
