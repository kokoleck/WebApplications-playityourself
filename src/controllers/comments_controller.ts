import { Request, Response } from "express";
import commentsModel, { iComment } from "../models/comments_model";
import BaseController from "./base_controller";
import { log } from "console";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    username?: string;
  };
}

class CommentsController extends BaseController<iComment> {
  constructor() {
    super(commentsModel);
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { postId, comment } = req.body;
      const userId = (req as AuthenticatedRequest).user?._id;

      if (!postId || !comment || !userId) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }

      // ✅ יצירת תגובה אחת בלבד
      const newComment = await commentsModel.create({
        postId,
        comment,
        owner: userId
      });

      const populated = await newComment.save();

      res.status(201).json({
          _id: populated._id,
        comment: populated.comment,
        username: populated.owner
      });

    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Failed to add comment", error: err });
    }
  }

  // שליפת תגובות לפי מזהה פוסט
  async getByPostId(req: Request, res: Response): Promise<void> {
    try {
      const postId = req.params.postId;
      const comments = await this.model.find({ postId }).populate('owner').sort({ createdAt: -1 });

      if (!comments || comments.length === 0) {
        res.status(404).json({ message: "No comments found for this post" });
        return;
      }

      res.status(200).json(comments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to get comments by post", error });
    }
  }
}

export default new CommentsController();
