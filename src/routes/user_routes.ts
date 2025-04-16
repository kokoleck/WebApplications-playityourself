import express, { Request, Response, NextFunction } from "express";
import { getUserProfile, updateUserProfile } from "../controllers/user_controller";

const router = express.Router();

const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get("/:id", asyncHandler(getUserProfile));
router.put("/:id", asyncHandler(updateUserProfile));

export default router;
