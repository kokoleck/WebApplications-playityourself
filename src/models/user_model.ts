import mongoose from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password?: string; // הופך ל־optional עבור משתמשים שמתחברים עם גוגל
  googleId?: string; // ✅ חדש: מזהה ייחודי ממשתמשי גוגל
  profileImage?: string;
  refreshToken?: string[];
}

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false, // 👈 כי גוגל לא שולחת סיסמה
    },
    googleId: {
      type: String,
      required: false,
      unique: true,
      sparse: true, // ✅ חשוב כדי לא להפריע למשתמשים רגילים
    },
    profileImage: {
      type: String,
    },
    refreshToken: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model<IUser>("Users", userSchema);

export default userModel;
