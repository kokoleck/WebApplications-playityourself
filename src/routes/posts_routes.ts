import express from "express";
const router = express.Router();

import postsController from "../controllers/post_controller";
import { authMiddleware } from "../middleware/auth"; //
import upload from "../middleware/multer_upload";

/**
 * Routes for managing posts
 */

// שליפת כל הפוסטים
router.get("/", postsController.getAll.bind(postsController));

// שליפת פוסט לפי ID
router.get("/:id", postsController.getById.bind(postsController));

// יצירת פוסט חדש
router.post("/", authMiddleware, upload.single("image"), postsController.create.bind(postsController));

// עדכון פוסט
router.put("/:id", authMiddleware, upload.single("image"), postsController.update.bind(postsController));

// לייק / הסרת לייק
router.put("/:id/like", authMiddleware, (req, res, next) => {
  postsController.likePost(req, res).catch(next);
});

// מחיקת פוסט (אם תוסיפי בהמשך deleteItem)
router.delete("/:id", authMiddleware, postsController.deleteItem?.bind(postsController));

export default router;
