import type { Request } from "express";

/** Route params are only ever missing when a route is wired to the wrong path — a programming error. */
export const requireParam = (req: Request, name: string): string => {
  // eslint-disable-next-line security/detect-object-injection -- `name` is always a route-param literal supplied by our own controllers, never user input
  const value = req.params[name];
  if (typeof value !== "string") {
    throw new Error(`Route parameter "${name}" was expected but is missing on ${req.path}`);
  }
  return value;
};
