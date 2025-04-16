import { Request, Response } from "express";
import postModel, { IPost } from "../models/post_model";
import BaseController from "./base_controller";

// טיפוס מותאם עבור בקשות עם req.user
interface AuthenticatedRequest extends Request {
  user?: string;
}

class PostsController extends BaseController<IPost> {
  constructor() {
    super(postModel);
  }

  // יצירת פוסט חדש
  async create(req: Request, res: Response) {
    try {
      const { title, content, owner, image } = req.body;

      if (!title || !content || !owner) {
        res.status(400).json({ message: "Missing required fields" });
        return;
              }

      const post = await postModel.create({ title, content, owner, image });
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to create post." });
    }
  }

  // סימון לייק / ביטול לייק
  async likePost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const postId = req.params.id;
      const userId = req.user;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const post = await postModel.findById(postId);
      if (!post) {
        res.status(404).json({ message: "Post not found" });
        return;
      }

      const alreadyLiked = post.likedBy?.includes(userId);

      if (alreadyLiked) {
        post.likedBy = post.likedBy?.filter((id) => id !== userId);
        post.likesCount = Math.max(0, (post.likesCount || 0) - 1);
      } else {
        post.likedBy = [...(post.likedBy || []), userId];
        post.likesCount = (post.likesCount || 0) + 1;
      }

      await post.save();
      res.json({ likesCount: post.likesCount, likedBy: post.likedBy });
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle like." });
    }
  }

  // עדכון פוסט (לבעל הפוסט בלבד)
  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const postId = req.params.id;
      const userId = req.user;

      const post = await postModel.findById(postId);
      if (!post) {
        res.status(404).json({ message: "Post not found" });
        return;
      }

      if (post.owner.toString() !== userId) {
        res.status(401).json({ message: "Not authorized" });
        return;
      }

      const { title, content } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : post.image;

      const updatedPost = await postModel.findByIdAndUpdate(
        postId,
        { title, content, image },
        { new: true }
      );

      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: "Failed to update post." });
    }
  }
}

export default new PostsController();
