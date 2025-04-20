// src/auth/googleAuth.ts
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import userModel from "../models/user_model";
import jwt from "jsonwebtoken";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "http://localhost:3001/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        let user = await userModel.findOne({ email });

        // אם המשתמש לא קיים – ניצור אותו
        if (!user) {
          user = await userModel.create({
            username: profile.displayName,
            email,
            password: Math.random().toString(36).slice(-8),
            profileImage: profile.photos?.[0].value,
          });
        }

        // יצירת JWT
        const secret = process.env.TOKEN_SECRET;
        if (!secret) throw new Error("Missing TOKEN_SECRET in env");

        const token = jwt.sign(
          { _id: user._id },
          secret,
          {
            expiresIn: "1h",
          }
        );

        // מחזירים את המשתמש עם הטוקן
        return done(null, { ...user.toObject(), token });
      } catch (err) {
        done(err);
      }
    }
  )
);

// נדרש גם אם לא משתמשים ב-session בפועל
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));
