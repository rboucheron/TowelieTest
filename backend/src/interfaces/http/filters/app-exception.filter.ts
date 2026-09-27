import { Catch, HttpException, type ArgumentsHost, type ExceptionFilter } from "@nestjs/common";
import type { Response } from "express";
import { ZodError } from "zod";
import { AppError, HTTP_STATUS_BY_CODE } from "@/shared/errors";
import { logger } from "@/infrastructure/services/logger";
import { env } from "@/infrastructure/persistence/env";

/** Codes for errors raised by Nest/Express itself (unknown route, malformed JSON, body too large…). */
const CODE_BY_HTTP_STATUS = new Map<number, string>([
  [400, "VALIDATION_ERROR"],
  [401, "UNAUTHENTICATED"],
  [403, "FORBIDDEN"],
  [404, "NOT_FOUND"],
  [413, "PAYLOAD_TOO_LARGE"],
  [429, "RATE_LIMITED"],
]);

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();

    if (exception instanceof AppError) {
      res
        .status(HTTP_STATUS_BY_CODE[exception.code])
        .json({ code: exception.code, message: exception.message });
      return;
    }

    if (exception instanceof ZodError) {
      res
        .status(400)
        .json({ code: "VALIDATION_ERROR", message: "Invalid request", details: exception.issues });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      res
        .status(status)
        .json({
          code: CODE_BY_HTTP_STATUS.get(status) ?? "HTTP_ERROR",
          message: exception.message,
        });
      return;
    }

    logger.error({ err: exception }, "Unhandled error");
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: env.NODE_ENV === "production" ? "An unexpected error occurred" : String(exception),
    });
  }
}
