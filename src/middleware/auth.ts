// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: string;
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.header("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token || !process.env.TOKEN_SECRET) {
    return res.status(401).send("Access Denied");
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
    if (err) return res.status(401).send("Invalid token");
    req.user = (payload as any)._id;
    next();
  });
};
