import type { Bug } from "@/domain/entities/bug";

export interface BugRepository {
  findById(id: string): Promise<Bug | null>;
  findAllForRecipeBook(recipeBookId: string): Promise<Bug[]>;
  create(bug: Bug): Promise<Bug>;
  update(bug: Bug): Promise<Bug>;
  remove(id: string): Promise<void>;
}
