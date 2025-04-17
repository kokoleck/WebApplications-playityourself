import request from "supertest";
import mongoose from "mongoose";
import initApp from "../app";
import path from "path";

let app: any;
let token: string;
let userId: string;

beforeAll(async () => {
  app = await initApp();

  // יצירת משתמש חדש (כדי לקבל טוקן)
  const res = await request(app).post("/api/users/register").send({
    email: "filetest@example.com",
    password: "123456",
    username: "FileTestUser",
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

describe("POST /api/posts - File Upload", () => {
  it("should upload an image with a new post", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .field("title", "Post with image")
      .field("content", "This post includes an image")
      .field("owner", userId)
      .attach("image", path.resolve(__dirname, "test_file.jpg"))

      console.log("UPLOAD STATUS:", res.status);
console.log("UPLOAD RESPONSE:", res.body);


    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("image");
    expect(res.body.image).toMatch(/uploads/);
  });
});
