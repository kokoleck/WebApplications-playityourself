import express, { Request, Response, NextFunction } from "express";
import { getUserProfile, updateUserProfile } from "../controllers/user_controller";
import { register, login, refresh, logout } from "../controllers/auth_controller";
import { upload } from "../middleware/multer_upload";


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

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - username
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 */
router.post("/register", asyncHandler(register));


/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid credentials
 */

  router.post("/login", asyncHandler(login));


  /**
 * @swagger
 * /api/users/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */

  router.post("/refresh", asyncHandler(refresh));


  /**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User logged out successfully
 */

  router.post("/logout", asyncHandler(logout));



  router.put("/:id", upload.single('profileImage'), asyncHandler(updateUserProfile)); // נתיב עדכון פרופיל משתמש



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

export default router;
