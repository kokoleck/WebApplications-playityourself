import request from "supertest";
import mongoose from "mongoose";
import initApp from "../app";
import postModel from "../models/post_model";
import userModel from "../models/user_model";

let app: any;
let token: string;
let userId: string;
let postId: string;

beforeAll(async () => {
  app = await initApp();
  await userModel.deleteMany({});
  await postModel.deleteMany({});

  const res = await request(app)
    .post("/api/users/register")
    .send({
      username: "TestUser",
      email: `testuser+${Date.now()}@example.com`,
      password: "123456",
    });

  token = res.body.accessToken;
  userId = res.body.user._id;
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

    postId = res.body._id;
  });

  it("🚫 Create Post - Missing Fields", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("🚫 Create Post - Unauthorized (No Token)", async () => {
    const postData = {
      title: "Unauthorized Post",
      content: "Should not be created",
    };

    const res = await request(app)
      .post("/api/posts")
      .send(postData);

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
    expect(res.body.image).toBe(postData.image);
  });

  it("✅ PATCH /posts/:id - Like and Unlike", async () => {
    const res1 = await request(app)
      .patch(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res1.status).toBe(200);
    expect(res1.body.likesCount).toBe(1);

    const res2 = await request(app)
      .patch(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res2.status).toBe(200);
    expect(res2.body.likesCount).toBe(0);
  });

  it("✅ PUT /posts/:id - Update Post", async () => {
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Updated Title",
        content: "Updated Content",
        image: "http://localhost:3001/uploads/updated.png",
      });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated Title");
    expect(res.body.image).toContain("updated.png");
  });

  it("✅ GET /posts - Get All Posts", async () => {
    const res = await request(app)
      .get("/api/posts?page=1&limit=10");

    expect(res.status).toBe(200);
    expect(res.body.posts.length).toBeGreaterThan(0);
  });

  it("✅ GET /posts/:id - Get Post by ID", async () => {
    const res = await request(app).get(`/api/posts/${postId}`);

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(postId);
  });

  it("✅ GET /posts/user/:userId - Get Posts by User", async () => {
    const res = await request(app).get(`/api/posts/user/${userId}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("✅ DELETE /posts/:id - Delete Post", async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });
});
