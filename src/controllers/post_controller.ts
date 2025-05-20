import { Request, Response } from "express";
import postModel, { IPost } from "../models/post_model";
import BaseController from "./base_controller";
import mongoose from "mongoose";
import postsModel from "../models/post_model"; 


export const getPostsByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const posts = await postsModel
    .find({userId: userId}) //   מחפש פוסטים לפי מזהה משתמש
    .populate('owner', 'username profileImage')  //   מוסיף טעינה של שם ותמונה של פוסט שמישהו העלה
    .sort({ createdAt: -1 });
      res.status(200).send(posts);
  } catch (error) {
    console.error(error);
    res.status(400).send("Failed to fetch posts by user");
  }
};



// טיפוס מותאם עבור בקשות עם req.user
interface AuthenticatedRequest extends Request {
  user?: { _id: string };
}

class PostsController extends BaseController<IPost> {
  constructor() {
    super(postModel);
  }


  
  // ✅ Pagination - שליפת כל הפוסטים עם תמיכה ב-page ו-limit
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page = "1", limit = "10", owner } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const filter = owner ? { owner } : {};
      const [posts, total] = await Promise.all([
        this.model
  .find(filter)
  .populate('owner', 'username profileImage') // 🛠️ זה מה שחסר לך כאן
  .skip(skip)
  .limit(limitNum)
  .sort({ createdAt: -1 })
,
        this.model.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      const postsWithCommentsCount = await Promise.all( /* הוספת ספירת תגובה לכל פוסט */
        posts.map(async (post) => {
          const count = await mongoose.model("comments").countDocuments({ postId: post._id });
          return {
            ...post.toObject(),
            commentsCount: count,
          };
        })
      );
      
      res.status(200).json({
        posts: postsWithCommentsCount,
        currentPage: pageNum,
        totalPages,
        totalCount: total,
      });
      
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts", error });
    }
  }

  // יצירת פוסט חדש עם תמונה
 // יצירת פוסט חדש עם תמונה
 async create(req: Request, res: Response): Promise<void> {
  try {
    const { title, content } = req.body;

    // נשתמש ב-type assertion כדי להכריח את TypeScript להבין שיש req.user
    const userId = (req as any).user?._id;

    //const image = req.file
    //  ? `http://localhost:3000/uploads/${req.file.filename}`//אופציה אחרת לשמירת התמונות לא כURL
     // : undefined;//

     const image = req.body.image || "";


    if (!title || !content || !userId) {
      res.status(400).json({ message: "Missing required fields." });
      return;
    }
console.log("user id", res.locals.userIdS)
    const post = await postModel.create({
      title,
      content,
      owner: res.locals.userId,
      image,
      userId: res.locals.userId
    });
    

    res.status(201).json( post );
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ message: error.message });
      return;
    }
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

  // סימון לייק / ביטול לייק
  async likePost(req: Request, res: Response): Promise<void> {
    try {
      const postId = req.params.id;
      const userId = (req as AuthenticatedRequest).user;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const post = await postModel.findById(postId);
      if (!post) {
        res.status(404).json({ message: "Post not found" });
        return;
      }

      const alreadyLiked = post.likedBy?.includes(userId._id);

      if (alreadyLiked) {
        post.likedBy = post.likedBy?.filter((id) => id !== userId._id);
        post.likesCount = Math.max(0, (post.likesCount || 0) - 1);
      } else {
        post.likedBy = [...(post.likedBy || []), userId._id];
        post.likesCount = (post.likesCount || 0) + 1;
      }

      await post.save();
      res.json({ likesCount: post.likesCount, likedBy: post.likedBy });
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle like." });
    }
  }

  // עדכון פוסט (לבעל הפוסט בלבד)
  async update(req1: Request, res: Response): Promise<void> {
    try {
      const req = req1 as AuthenticatedRequest;
      const postId = req.params.id;
      const userId = req.user;

        const post = await postModel.findById(postId);
      if (!post) {
        res.status(404).json({ message: "Post not found" });
        return;
      }

      if (post.owner.toString() !== userId?._id) {
        res.status(401).json({ message: "Not authorized" });
        return;
      }

    const { title, content, image } = req.body; //שמירת תמונה קיימת אם לא הועלתה חדשה
        const updatedImage = image !== undefined && image !== "" ? image : post.image;



      const updatedPost = await postModel.findByIdAndUpdate(
        postId,
        { title, content, image: updatedImage, },
        { new: true }
      );

      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: "Failed to update post." });
    }
  }
}


export const deletePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;

    const deletedPost = await postModel.findByIdAndDelete(postId);

    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Failed to delete post" });
  }
};

export default new PostsController();
