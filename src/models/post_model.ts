import mongoose from "mongoose";

export interface IPost {
  title: string;
  content: string;
  owner: string;
  image?: string;
  likesCount?: number;
  likedBy?: string[];
}

const postSchema = new mongoose.Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    owner: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    likedBy: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const postModel = mongoose.model<IPost>("Posts", postSchema);

export default postModel;
