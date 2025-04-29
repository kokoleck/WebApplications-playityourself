// src/tests/post.test.ts

import request from "supertest";
import mongoose from "mongoose";
import initApp from "../app";
import postModel from "../models/post_model";
import userModel from "../models/user_model";

let app: any;
let token: string;

beforeAll(async () => {
  app = await initApp();

  await userModel.deleteMany({});
  await postModel.deleteMany({});

  const res = await request(app)
    .post("/api/users/register")
    .send({
      username: "TestUser",
      email: "testuser@example.com",
      password: "123456",
    });

  token = res.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("POST /api/posts", () => {
  it("should create a new post", async () => {
    const postData = {
      title: "Test Post",
      content: "This is a test post",
    };

    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send(postData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.title).toBe(postData.title);
    expect(res.body.content).toBe(postData.content);
  });

  it("should fail to create a post without required fields", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });
});
