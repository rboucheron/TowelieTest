import { type Result, ok, err } from "@/shared/result";
import { validationError, type AppError } from "@/shared/errors";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  private constructor(private readonly value: string) {}

  static create(raw: string): Result<Email, AppError> {
    const normalized = raw.trim().toLowerCase();
    if (normalized.length === 0 || normalized.length > 254 || !EMAIL_REGEX.test(normalized)) {
      return err(validationError(`"${raw}" is not a valid email address`));
    }
    return ok(new Email(normalized));
  }

  toString(): string {
    return this.value;
  }
}
