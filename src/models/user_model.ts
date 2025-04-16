import mongoose from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password: string;
  profileImage?: string;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String },
  },
  { timestamps: true }
);

const userModel = mongoose.model<IUser>("Users", userSchema);

export default userModel;
