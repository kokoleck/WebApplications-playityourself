import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: string;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.header("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token || !process.env.TOKEN_SECRET) {
    res.status(401).send("Access Denied");
    return;
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
    if (err) {
      res.status(401).send("Invalid token");
      return;
    }

    req.user = (payload as any)._id;
    next();
  });
};
