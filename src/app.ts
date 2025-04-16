import dotenv from "dotenv";
dotenv.config();

import express, { Express } from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";
import userRoutes from "./routes/user_routes";

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files (אם תעלי תמונות)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/users", userRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("Welcome to PlayItYourself API!");
});

// Mongoose & App init
const initApp = () => {
  return new Promise<Express>((resolve, reject) => {
    if (!process.env.DB_CONNECT) {
      return reject("Missing DB_CONNECT in .env");
    }

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
