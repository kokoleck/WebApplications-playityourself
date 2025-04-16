import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../models/user_model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// טיפוס מורחב לבקשה עם user
interface AuthenticatedRequest extends Request {
  user?: string;
}

// יוצרת טוקנים עבור המשתמש
const generateToken = (userId: string) => {
  if (!process.env.TOKEN_SECRET || !process.env.TOKEN_EXPIRES || !process.env.REFRESH_TOKEN_EXPIRES) return null;

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

    user.refreshToken = [tokens.refreshToken];
    await user.save();

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

    user.refreshToken = [...(user.refreshToken || []), tokens.refreshToken];
    await user.save();

    res.status(200).send({
      user: { _id: user._id, email: user.email, username: user.username },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (err) {
    res.status(400).send("Login failed");
  }
};

// אימות טוקן
export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.header("authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token || !process.env.TOKEN_SECRET) return res.status(401).send("Access Denied");

  jwt.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
    if (err) return res.status(401).send("Invalid token");
    req.user = (payload as any)._id;
    next();
  });
};

// אימות רענון טוקן
const verifyRefreshToken = (refreshToken: string): Promise<InstanceType<typeof userModel>> => {
  return new Promise(async (resolve, reject) => {
    if (!process.env.TOKEN_SECRET) return reject("Invalid token");

    jwt.verify(refreshToken, process.env.TOKEN_SECRET, async (err, payload: any) => {
      if (err) return reject("Invalid token");

      const user = await userModel.findById(payload._id);
      if (!user || !user.refreshToken?.includes(refreshToken)) {
        return reject("Invalid token");
      }

      user.refreshToken = user.refreshToken.filter((t) => t !== refreshToken);
      await user.save();
      resolve(user);
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
