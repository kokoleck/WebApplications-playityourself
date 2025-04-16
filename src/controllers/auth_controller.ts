import { Request, Response } from "express";
import userModel, { IUser } from "../models/user_model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose, { Document, Types } from "mongoose";

// טיפוס מורחב למשתמש כולל _id ו־save
type IUserDoc = IUser &
  Document & {
    _id: Types.ObjectId;
    refreshToken?: string[];
    save: () => Promise<IUserDoc>;
  };

// פונקציית יצירת טוקנים
const generateToken = (userId: string) => {
  if (
    !process.env.TOKEN_SECRET ||
    !process.env.TOKEN_EXPIRES ||
    !process.env.REFRESH_TOKEN_EXPIRES
  )
    return null;

  const payload = { _id: userId, random: Math.random().toString() };

  const accessToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: parseInt(process.env.TOKEN_EXPIRES),
  });

  const refreshToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRES),
  });

  return { accessToken, refreshToken };
};

// הרשמה
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      email,
      password: hashedPassword,
      username,
    });

    const tokens = generateToken(user._id.toString());
    if (!tokens) return res.status(500).send("Token creation failed");

    (user as IUserDoc).refreshToken = [tokens.refreshToken];
    await (user as IUserDoc).save();

    res.status(201).send({
      user: { _id: user._id, email: user.email, username: user.username },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (err) {
    res.status(400).send("Registration failed");
  }
};

// התחברות
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).send("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid credentials");

    const tokens = generateToken(user._id.toString());
    if (!tokens) return res.status(500).send("Token generation failed");

    const u = user as IUserDoc;
    u.refreshToken = [...(u.refreshToken || []), tokens.refreshToken];
    await u.save();

    res.status(200).send({
      user: { _id: user._id, email: user.email, username: user.username },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (err) {
    res.status(400).send("Login failed");
  }
};

// בדיקת refreshToken
const verifyRefreshToken = (refreshToken: string): Promise<IUserDoc> => {
  return new Promise(async (resolve, reject) => {
    if (!process.env.TOKEN_SECRET) return reject("Invalid token");

    jwt.verify(refreshToken, process.env.TOKEN_SECRET, async (err, payload: any) => {
      if (err) return reject("Invalid token");

      const user = await userModel.findById(payload._id);
      if (!user || !(user as IUserDoc).refreshToken?.includes(refreshToken)) {
        return reject("Invalid token");
      }

      const u = user as IUserDoc;
      u.refreshToken = u.refreshToken?.filter((t) => t !== refreshToken);
      await u.save();
      resolve(u);
    });
  });
};

// ריענון טוקנים
export const refresh = async (req: Request, res: Response) => {
  try {
    const user = await verifyRefreshToken(req.body.refreshToken);
    const tokens = generateToken(user._id.toString());
    if (!tokens) return res.status(500).send("Token creation failed");

    user.refreshToken = [...(user.refreshToken || []), tokens.refreshToken];
    await user.save();

    res.status(200).send({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch {
    res.status(401).send("Invalid refresh token");
  }
};

// יציאה
export const logout = async (req: Request, res: Response) => {
  try {
    const user = await verifyRefreshToken(req.body.refreshToken);
    await user.save();
    res.status(200).send("Logged out");
  } catch {
    res.status(400).send("Logout failed");
  }
};
// Middleware לאימות טוקן
export const authMiddleware = (req: Request, res: Response, next: Function) => {
    const authHeader = req.header("authorization");
    const token = authHeader && authHeader.split(" ")[1];
  
    if (!token || !process.env.TOKEN_SECRET) {
      return res.status(401).send("Access Denied");
    }
  
    jwt.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
      if (err) return res.status(401).send("Invalid token");
      (req as any).user = (payload as any)._id; // נכניס את ה־user ל־req
      next();
    });
  };
  