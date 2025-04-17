import express, { Request, Response, NextFunction } from "express";
import { getUserProfile, updateUserProfile } from "../controllers/user_controller";
import { register, login, refresh, logout } from "../controllers/auth_controller";


/**
 * @swagger
 * tags:
 *   name: Users
 *   description: The Users API
 */

const router = express.Router();

const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
  ) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

  // 🔹 נוספו ראוטים של הרשמה, התחברות וכו'
  router.post("/register", asyncHandler(register));
  router.post("/login", asyncHandler(login));
  router.post("/refresh", asyncHandler(refresh));
  router.post("/logout", asyncHandler(logout));
  


/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successful response with user data
 *       404:
 *         description: User not found
 */
router.get("/:id", asyncHandler(getUserProfile));

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               profileImage:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put("/:id", asyncHandler(updateUserProfile));

export default router;
