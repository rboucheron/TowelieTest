import { type Result, ok, err } from "@/shared/result";
import { validationError, type AppError } from "@/shared/errors";

export interface ProductProps {
  id: string;
  groupId: string;
  name: string;
}

export class Product {
  private constructor(private readonly props: ProductProps) {}

  static create(props: ProductProps): Result<Product, AppError> {
    if (props.name.trim().length === 0 || props.name.length > 150) {
      return err(validationError("Product name must be between 1 and 150 characters"));
    }
    return ok(new Product({ ...props, name: props.name.trim() }));
  }

  static reconstitute(props: ProductProps): Product {
    return new Product(props);
  }

  get id(): string {
    return this.props.id;
  }

  get groupId(): string {
    return this.props.groupId;
  }

  get name(): string {
    return this.props.name;
  }
}
