import { Request, Response } from "express";
import userModel from "../models/user_model";

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.status(200).send(user);
  } catch (err) {
    res.status(400).send(err);
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { username, profileImage } = req.body;

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { username, profileImage },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    res.status(200).send(updatedUser);
  } catch (err) {
    res.status(400).send(err);
  }
};
