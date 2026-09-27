import type { PrismaClient, BugComment as PrismaBugComment } from "@prisma/client";
import type { BugCommentRepository } from "@/domain/repositories/bug-comment-repository";
import { BugComment } from "@/domain/entities/bug-comment";

const toDomain = (record: PrismaBugComment): BugComment =>
  BugComment.reconstitute({
    id: record.id,
    bugId: record.bugId,
    authorId: record.authorId,
    content: record.content,
    createdAt: record.createdAt,
  });

export class PrismaBugCommentRepository implements BugCommentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAllForBug(bugId: string): Promise<BugComment[]> {
    const records = await this.prisma.bugComment.findMany({
      where: { bugId },
      orderBy: { createdAt: "asc" },
    });
    return records.map(toDomain);
  }

  async create(comment: BugComment): Promise<BugComment> {
    const record = await this.prisma.bugComment.create({
      data: {
        id: comment.id,
        bugId: comment.bugId,
        authorId: comment.authorId,
        content: comment.content,
        createdAt: comment.createdAt,
      },
    });
    return toDomain(record);
  }
}
