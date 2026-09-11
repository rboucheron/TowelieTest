import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError, HTTP_STATUS_BY_CODE } from "@/shared/errors";
import { logger } from "@/infrastructure/services/logger";
import { env } from "@/infrastructure/persistence/env";

export const sendAppError = (res: Response, error: AppError): void => {
  res.status(HTTP_STATUS_BY_CODE[error.code]).json({ code: error.code, message: error.message });
};

/** Express recognizes error middleware by its 4-argument arity — _req/_next must stay even if unused. */
export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (error instanceof AppError) {
    sendAppError(res, error);
    return;
  }

  if (error instanceof ZodError) {
    res
      .status(400)
      .json({ code: "VALIDATION_ERROR", message: "Invalid request", details: error.issues });
    return;
  }

  logger.error({ err: error }, "Unhandled error");
  res.status(500).json({
    code: "INTERNAL_ERROR",
    message: env.NODE_ENV === "production" ? "An unexpected error occurred" : String(error),
  });
};
