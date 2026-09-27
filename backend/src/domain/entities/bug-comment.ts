import { type Result, ok, err } from "@/shared/result";
import { validationError, type AppError } from "@/shared/errors";

export interface BugCommentProps {
  id: string;
  bugId: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

export class BugComment {
  private constructor(private readonly props: BugCommentProps) {}

  static create(props: BugCommentProps): Result<BugComment, AppError> {
    const content = props.content.trim();
    if (content.length === 0 || content.length > 5000) {
      return err(validationError("Comment must be between 1 and 5000 characters"));
    }
    return ok(new BugComment({ ...props, content }));
  }

  static reconstitute(props: BugCommentProps): BugComment {
    return new BugComment(props);
  }

  get id(): string {
    return this.props.id;
  }

  get bugId(): string {
    return this.props.bugId;
  }

  get authorId(): string {
    return this.props.authorId;
  }

  get content(): string {
    return this.props.content;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
