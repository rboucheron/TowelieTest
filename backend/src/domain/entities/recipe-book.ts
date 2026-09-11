import { type Result, ok, err } from "@/shared/result";
import { validationError, type AppError } from "@/shared/errors";

export interface RecipeBookProps {
  id: string;
  groupId: string;
  title: string;
  description: string;
  logo: string | null;
  productIds: string[];
  createdAt: Date;
}

export class RecipeBook {
  private constructor(private readonly props: RecipeBookProps) {}

  static create(props: RecipeBookProps): Result<RecipeBook, AppError> {
    if (props.title.trim().length === 0 || props.title.length > 200) {
      return err(validationError("Recipe book title must be between 1 and 200 characters"));
    }
    if (props.description.length > 5000) {
      return err(validationError("Recipe book description must be at most 5000 characters"));
    }
    return ok(new RecipeBook({ ...props, title: props.title.trim() }));
  }

  static reconstitute(props: RecipeBookProps): RecipeBook {
    return new RecipeBook(props);
  }

  get id(): string {
    return this.props.id;
  }

  get groupId(): string {
    return this.props.groupId;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get logo(): string | null {
    return this.props.logo;
  }

  get productIds(): string[] {
    return this.props.productIds;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
