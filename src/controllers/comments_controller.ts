    import { Request, Response } from "express";
    import commentsModel, { iComment } from "../models/comments_model";
    import BaseController from "./base_controller";

    class CommentsController extends BaseController<iComment> {
    constructor() {
        super(commentsModel);
    }

    // שליפת תגובות לפי מזהה פוסט
    async getByPostId(req: Request, res: Response): Promise<void> {
        try {
          const postId = req.params.postId;
          const comments = await this.model.find({ postId });
      
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
