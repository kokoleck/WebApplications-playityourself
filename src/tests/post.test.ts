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

  it("✅ Create Post - Success", async () => {
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
    expect(res.body).toHaveProperty("owner");
    expect(res.body).toHaveProperty("userId");
    expect(res.body.likesCount).toBe(0);
    expect(res.body.likedBy).toEqual([]);
  });

  it("🚫 Create Post - Missing Fields", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({}); // Missing title/content

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("🚫 Create Post - Unauthorized (No Token)", async () => {
    const postData = {
      title: "Unauthorized Post",
      content: "Should not be created",
    };

    const res = await request(app)
      .post("/api/posts")
      .send(postData); // No token

    expect(res.status).toBe(401);
  });

  it("🚫 Create Post - Invalid Token", async () => {
    const postData = {
      title: "Invalid Token Post",
      content: "Should not be created",
    };

    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", "Bearer invalidtoken123")
      .send(postData);

    expect(res.status).toBe(401);
  });

  it("✅ Create Post - With Image", async () => {
    const postData = {
      title: "Post With Image",
      content: "This post has an image URL",
      image: "http://localhost:3001/uploads/test-image.png",
    };

    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send(postData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("image");
    expect(res.body.image).toBe(postData.image);
  });
});
