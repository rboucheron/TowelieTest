import { type Result, ok, err } from "@/shared/result";
import { validationError, type AppError } from "@/shared/errors";
import { Email } from "@/domain/value-objects/email";

export interface UserProps {
  id: string;
  email: Email;
  passwordHash: string;
  firstName: string;
  lastName: string;
  isSuperAdmin: boolean;
  createdAt: Date;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: Omit<UserProps, "email"> & { email: string }): Result<User, AppError> {
    const emailResult = Email.create(props.email);
    if (!emailResult.success) return err(emailResult.error);

    if (props.firstName.trim().length === 0 || props.firstName.length > 100) {
      return err(validationError("First name must be between 1 and 100 characters"));
    }
    if (props.lastName.trim().length === 0 || props.lastName.length > 100) {
      return err(validationError("Last name must be between 1 and 100 characters"));
    }

    return ok(
      new User({
        ...props,
        email: emailResult.data,
        firstName: props.firstName.trim(),
        lastName: props.lastName.trim(),
      })
    );
  }

  /** Rehydrates a User already known to be valid (e.g. read back from the database). */
  static reconstitute(props: Omit<UserProps, "email"> & { email: string }): User {
    const emailResult = Email.create(props.email);
    if (!emailResult.success) {
      throw new Error(`Corrupt persisted user ${props.id}: invalid email`);
    }
    return new User({ ...props, email: emailResult.data });
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email.toString();
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get isSuperAdmin(): boolean {
    return this.props.isSuperAdmin;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
