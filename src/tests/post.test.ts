// src/tests/post.test.ts

import request from "supertest";
import mongoose from "mongoose";
import initApp from "../app";
import postModel from "../models/post_model";
import userModel from "../models/user_model";

let app: any;
let token: string;
let userId: string;

beforeAll(async () => {
  app = await initApp();

  // מנקים את המשתמשים והפוסטים מהבדיקות הקודמות
  await userModel.deleteMany({});
  await postModel.deleteMany({});

  // יוצרים משתמש חדש ומקבלים accessToken
  const res = await request(app)
    .post("/api/users/register")
    .send({
      username: "TestUser",
      email: "testuser@example.com",
      password: "123456",
    });
    console.log("REGISTER RESPONSE:", res.body);


  token = res.body.accessToken;
  userId = res.body.user._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("POST /api/posts", () => {
  it("should create a new post", async () => {
    const postData = {
      title: "Test Post",
      content: "This is a test post",
      owner: userId,
    };

    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send(postData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.title).toBe(postData.title);
  });

  it("should fail to create a post without required fields", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "", content: "", owner: "" });

    expect(res.status).toBe(400);
  });
});
