import type { PipeTransform } from "@nestjs/common";
import type { ZodType, ZodTypeDef } from "zod";

/** `@Body(new ZodValidationPipe(Schema))` — a ZodError is rendered as a 400 by AppExceptionFilter. */
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T, ZodTypeDef, unknown>) {}

  transform(value: unknown): T {
    return this.schema.parse(value);
  }
}
