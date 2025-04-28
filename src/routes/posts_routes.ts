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
     * components:
     *   schemas:
     *     Post:
     *       type: object
     *       required:
     *         - title
     *         - content
     *       properties:
     *         _id:
     *           type: string
     *           description: The auto-generated id of the post
     *         title:
     *           type: string
     *           description: The title of the post
     *         content:
     *           type: string
     *           description: The content of the post
     *         owner:
     *           type: string
     *           description: The owner id of the post
     *         userId:
     *           type: string
     *           description: The ID of the user who created the post
     *       example:
     *         _id: 245234t234234r234r23f4
     *         title: My First Post
     *         content: This is the content of my first post.
     *         owner: 324vt23r4tr234t245tbv45by
     *         userId: 60f5a8b4e31f5b3f0f77d75e
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
    router.put("/:id", authMiddleware, postsController.update.bind(postsController));

    router.get("/user/:userId", asyncHandler(getPostsByUser));

    router.delete("/:id", authMiddleware, asyncHandler(deletePost));


    export default router;
