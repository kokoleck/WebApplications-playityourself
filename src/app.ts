import dotenv from "dotenv";
dotenv.config();

import express, { Express } from "express";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";
import mongoose from "mongoose";

// Routes
import userRoutes from "./routes/user_routes";
import postRoutes from "./routes/posts_routes";
import commentRoutes from "./routes/comments_routes";

const app = express();

// Middleware
app.use(
    cors({
      origin: "http://localhost:3000", // כתובת הפרונט שלך
      credentials: true, // אם תשתמשי ב-cookies בעתיד
    })
  );
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("Welcome to PlayItYourself API!");
});

// Mongo connection + return app
const initApp = () => {
  return new Promise<Express>((resolve, reject) => {
    if (!process.env.DB_CONNECT) return reject("Missing DB_CONNECT in .env");

    mongoose
      .connect(process.env.DB_CONNECT)
      .then(() => {
        console.log("Connected to MongoDB");
        resolve(app);
      })
      .catch((err) => reject(err));
  });
};

export default initApp;
