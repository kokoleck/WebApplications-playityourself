    import express, { Request, Response, NextFunction } from "express";
    import { Router } from "express";
    import postsController from "../controllers/post_controller"; //  ייבוא ברירת מחדל
    import { getPostsByUser, deletePost } from "../controllers/post_controller"; //  ייבוא של פונקציות
    import { authMiddleware } from "../controllers/auth_controller";
    import { upload } from "../middleware/multer_upload";

    const router = express.Router();

    // מייבאים את הפונקציה getPostsByUser מהקונטרולר של הפוסטים
    const asyncHandler = (
        fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
    ) => (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };

    /**
     * @swagger
     * tags:
     *   name: Posts
     *   description: The Posts API
     */

    /**
     * @swagger
/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - owner
 *         - userId
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ID of the post
 *         title:
 *           type: string
 *           description: Title of the post
 *         content:
 *           type: string
 *           description: Content of the post
 *         owner:
 *           type: string
 *           description: ID of the user who created the post
 *         image:
 *           type: string
 *           description: URL of the post's image (optional)
 *         likesCount:
 *           type: number
 *           description: Number of likes on the post
 *         likedBy:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs who liked the post
 *         userId:
 *           type: string
 *           description: ID of the user
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *       example:
 *         _id: "661c1234567890abcdef1234"
 *         title: "Amazing DIY Game"
 *         content: "This is a fun and easy DIY game you can create at home..."
 *         owner: "661bfa1234567890abcdef12"
 *         image: "http://localhost:3001/uploads/game.png"
 *         likesCount: 5
 *         likedBy:
 *           - "661bfa1234567890abcdef12"
 *           - "661bfa2234567890abcdef34"
 *         userId: "661bfa1234567890abcdef12"
 *         createdAt: "2025-04-28T10:30:00.000Z"
 *         updatedAt: "2025-04-28T10:30:00.000Z"
 */
    

    /**
     * @swagger
     * /posts:
     *   get:
     *     summary: Get all posts
     *     description: Retrieve a list of all posts
     *     tags:
     *       - Posts
     *     responses:
     *       200:
     *         description: A list of posts
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Post'
     *       500:
     *         description: Server error
     */
    router.get("/", postsController.getAll.bind(postsController));

    /**
     * @swagger
     * /posts/{id}:
     *   get:
     *     summary: Get a post by ID
     *     description: Retrieve a single post by its ID
     *     tags:
     *       - Posts
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: The ID of the post
     *     responses:
     *       200:
     *         description: A single post
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Post'
     *       404:
     *         description: Post not found
     *       500:
     *         description: Server error
     */
    router.get("/:id", postsController.getById.bind(postsController));

    /**
     * @swagger
     * /posts:
     *   post:
     *     summary: Create a new post
     *     description: Create a new post
     *     tags:
     *       - Posts
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *                 description: The title of the post
     *               content:
     *                 type: string
     *                 description: The content of the post
     *               image:
     *                 type: string
     *                 description: The URL of the image associated with the post
     *             required:
     *               - title
     *               - content
     *     responses:
     *       201:
     *         description: Post created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Post'
     *       400:
     *         description: Invalid input
     *       500:
     *         description: Server error
     */

    /**
     * @swagger
     * /posts/{id}:
     *   delete:
     *     summary: Delete a post by ID
     *     description: Delete a single post by its ID
     *     tags:
     *       - Posts
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: The ID of the post
     *     responses:
     *       200:
     *         description: Post deleted successfully
     *       404:
     *         description: Post not found
     *       500:
     *         description: Server error
     */

    router.post("/", authMiddleware, postsController.create.bind(postsController));

    router.patch("/:id", authMiddleware, postsController.likePost.bind(postsController));

    /**
 * @swagger
 * /posts/{id}:
 *   patch:
 *     summary: Like a post
 *     description: Add a like to a post by ID
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post to like
 *     responses:
 *       200:
 *         description: Post liked successfully
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */

    router.put("/:id", authMiddleware, postsController.update.bind(postsController));

    /**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post
 *     description: Update a post by ID
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */



    router.get("/user/:userId", asyncHandler(getPostsByUser));

    /**
 * @swagger
 * /posts/user/{userId}:
 *   get:
 *     summary: Get posts by user
 *     description: Retrieve all posts created by a specific user
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       404:
 *         description: No posts found
 *       500:
 *         description: Server error
 */


    router.delete("/:id", authMiddleware, asyncHandler(deletePost));


    export default router;
