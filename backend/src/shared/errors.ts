export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "ALREADY_EXISTS"
  | "INVALID_CREDENTIALS"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "TOKEN_EXPIRED";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly details?: unknown;

  constructor(code: AppErrorCode, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export const notFound = (resource: string): AppError =>
  new AppError("NOT_FOUND", `${resource} not found`);

export const alreadyExists = (resource: string): AppError =>
  new AppError("ALREADY_EXISTS", `${resource} already exists`);

export const forbidden = (
  message = "You do not have permission to perform this action"
): AppError => new AppError("FORBIDDEN", message);

export const unauthenticated = (message = "Authentication required"): AppError =>
  new AppError("UNAUTHENTICATED", message);

export const invalidCredentials = (): AppError =>
  new AppError("INVALID_CREDENTIALS", "Invalid email or password");

export const validationError = (message: string, details?: unknown): AppError =>
  new AppError("VALIDATION_ERROR", message, details);

export const HTTP_STATUS_BY_CODE: Record<AppErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHENTICATED: 401,
  INVALID_CREDENTIALS: 401,
  TOKEN_EXPIRED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  ALREADY_EXISTS: 409,
};
