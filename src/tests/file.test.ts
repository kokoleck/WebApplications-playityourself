import request from "supertest";
import mongoose from "mongoose";
import initApp from "../app";
import path from "path";

let app: any;
let token: string;
let userId: string;

beforeAll(async () => {
  app = await initApp();

  const res = await request(app).post("/api/users/register").send({
    email: `fileuser+${Date.now()}@example.com`,
    password: "123456",
    username: "FileUser",
  });

  token = res.body.accessToken;
  userId = res.body.user._id;
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
  await mongoose.disconnect();
});

describe("📁 File Upload API Tests", () => {
  it("✅ POST /files - should upload a file and return URL", async () => {
    const res = await request(app)
      .post("/api/files")
      .attach("file", path.resolve(__dirname, "test_file.jpg"));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("url");
    expect(res.body.url).toMatch(/uploads/);
  });

  it("🚫 POST /files - should fail without file", async () => {
    const res = await request(app).post("/api/files");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("✅ PUT /files/users/image/:userId - should update user profile image", async () => {
    const res = await request(app)
      .put(`/api/files/users/image/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .attach("profileImage", path.resolve(__dirname, "test_file.jpg"));

    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty("profileImage"); // 💡 שונה מ-"image"
    expect(res.body.user.profileImage).toMatch(/uploads/);
  });

  it("🚫 PUT /files/users/image/:userId - fail without file", async () => {
    const res = await request(app)
      .put(`/api/files/users/image/${userId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("🚫 PUT /files/users/image/:userId - fail with invalid user", async () => {
    const res = await request(app)
      .put(`/api/files/users/image/000000000000000000000000`)
      .set("Authorization", `Bearer ${token}`)
      .attach("profileImage", path.resolve(__dirname, "test_file.jpg"));

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

it("🚫 PUT /files/users/image/:userId - fail without token", async () => {
  const res = await request(app)
    .put(`/api/files/users/image/${userId}`)
    .set("Content-Type", "multipart/form-data"); // סימולציה של שליחת קובץ בלי טוקן

  expect(res.status).toBe(401);
});

});
