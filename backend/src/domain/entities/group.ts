import { type Result, ok, err } from "@/shared/result";
import { validationError, type AppError } from "@/shared/errors";

export interface GroupProps {
  id: string;
  name: string;
  logo: string | null;
  createdAt: Date;
}

export class Group {
  private constructor(private readonly props: GroupProps) {}

  static create(props: GroupProps): Result<Group, AppError> {
    if (props.name.trim().length === 0 || props.name.length > 150) {
      return err(validationError("Group name must be between 1 and 150 characters"));
    }
    return ok(new Group({ ...props, name: props.name.trim() }));
  }

  static reconstitute(props: GroupProps): Group {
    return new Group(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get logo(): string | null {
    return this.props.logo;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
