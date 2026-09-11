import type { NextFunction, Request, Response } from "express";

export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.actor?.isSuperAdmin) {
    res.status(403).json({ code: "FORBIDDEN", message: "Super-Admin privileges required" });
    return;
  }
  next();
};
