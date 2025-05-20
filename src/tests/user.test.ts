// src/tests/user.test.ts
import request from "supertest";
import mongoose from "mongoose";
import initApp from "../app";
import userModel from "../models/user_model";
import path from "path";

let app: any;
let token: string;
let userId: string;

beforeAll(async () => {
  app = await initApp();
  await userModel.deleteMany({});

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

describe("User Profile Tests", () => {
  test("GET /api/users/:id - should return user profile", async () => {
    const res = await request(app).get(`/api/users/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("username");
    expect(res.body).not.toHaveProperty("password");
  });

  test("GET /api/users/:id - should return 404 for non-existing user", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/users/${fakeId}`);
    expect(res.statusCode).toBe(404);
  });

  test("PUT /api/users/:id - update username", async () => {
    const res = await request(app)
      .put(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .field("username", "UpdatedUser");

    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe("UpdatedUser");
  });

  test("PUT /api/users/:id - update with image", async () => {
    const res = await request(app)
      .put(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .field("username", "WithImage")
.attach("profileImage", path.resolve(__dirname, "test_file.jpg"))
    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe("WithImage");
    expect(res.body.profileImage).toContain("/uploads/");
  });

  test("PUT /api/users/:id - user not found", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/users/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .field("username", "NoSuchUser");

    expect(res.statusCode).toBe(404);
  });
});
