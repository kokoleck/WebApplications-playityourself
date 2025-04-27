import mongoose, { Schema, Document } from "mongoose";

// הגדרת Interface לפוסט
export interface IPost {
  title: string;
  content: string;
  owner: mongoose.Types.ObjectId; // שם המשתמש שיצר את הפוסט
  image?: string;
  likesCount?: number;
  likedBy?: string[]; // רשימת משתמשים שעשו לייק לפוסט
  userId: mongoose.Schema.Types.ObjectId; // מזהה המשתמש במונגו
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
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
    userId: { // מזהה המשתמש במונגו
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // מקשר את הפוסט למודל משתמש במונגו
      required: true,
    },
  },
  { timestamps: true } // תיעוד תאריך יצירה ועדכון של הפוסט
);

// יצירת המודל
const postModel = mongoose.model<IPost>("Posts", postSchema);

export default postModel;
