import type { AppError } from "@/shared/errors";
import type { Result } from "@/shared/result";

/** Turns a failed use-case Result into a thrown AppError, rendered by AppExceptionFilter. */
export const unwrap = <T>(result: Result<T, AppError>): T => {
  if (!result.success) throw result.error;
  return result.data;
};
