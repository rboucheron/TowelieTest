import type { BugComment } from "@/domain/entities/bug-comment";

export interface BugCommentRepository {
  findAllForBug(bugId: string): Promise<BugComment[]>;
  create(comment: BugComment): Promise<BugComment>;
}
