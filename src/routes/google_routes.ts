import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import userModel from "../models/user_model";

const router = express.Router();

// התחלת תהליך ההתחברות עם גוגל
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// נקודת חזרה מגוגל
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/signin", session: false }),
  async (req, res) => {
    const user = req.user as {
      id: string;
      username: string;
      email: string;
      photo?: string;
    };

    try {
      // בודקים אם המשתמש כבר קיים
      let existingUser = await userModel.findOne({ email: user.email  });

      if (!existingUser) {
        // אם לא קיים – יוצרים משתמש חדש
        existingUser = await userModel.create({
          username: user.username,
          email: user.email,
          profileImage: user.photo,
          googleId: user.id,
        });
      } else if (!existingUser.googleId) {
        // 🔗 אם המשתמש קיים אבל עדיין בלי googleId – מעדכנים אותו
        existingUser.googleId = user.id;
        await existingUser.save();
      }

      // יוצרים טוקן
      const accessToken = jwt.sign(
        { _id: existingUser._id },
        process.env.TOKEN_SECRET!,
        { expiresIn: "1h" }
      );

      // מחזירים את הטוקן לפרונט דרך redirect
      res.redirect(
        `http://localhost:3000/signin?token=${accessToken}&userId=${existingUser._id}&username=${encodeURIComponent(
          existingUser.username
        )}&profileImage=${encodeURIComponent(existingUser.profileImage || "/default-profile.png")}`
      );
    } catch (err) {
      console.error("Google login error:", err);
      res.redirect("/signin");
    }
  }
);

export default router;
