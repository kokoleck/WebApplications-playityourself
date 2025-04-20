import express from "express";
const router = express.Router();
import commentsController from "../controllers/comments_controller";
import { authMiddleware } from "../controllers/auth_controller";

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: The Comments API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - comment
 *         - postId
 *         - owner
 *       properties:
 *         _id:
 *           type: string
 *         comment:
 *           type: string
 *         postId:
 *           type: string
 *         owner:
 *           type: string
 *       example:
 *         _id: 624bc3a7e9cf1c0015f24a9a
 *         comment: This game is awesome!
 *         postId: 623eefa6c6b1a700151c1eaa
 *         owner: 623edbea09b1e000155d77a0
 */

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get all comments
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: A list of all comments
 */
router.get("/", commentsController.getAll.bind(commentsController));

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment fetched successfully
 *       404:
 *         description: Comment not found
 */
router.get("/:id", commentsController.getById.bind(commentsController));

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       201:
 *         description: Comment created
 *       400:
 *         description: Invalid input
 */
router.post("/", authMiddleware, commentsController.create.bind(commentsController));

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted
 *       404:
 *         description: Comment not found
 */
router.delete("/:id", authMiddleware, commentsController.deleteItem.bind(commentsController));

export default router;
