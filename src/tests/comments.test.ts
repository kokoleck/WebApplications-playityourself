// src/tests/comments.test.ts

import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import commentsModel from "../models/comments_model";
import postsModel from "../models/post_model";
import { Express } from "express";

let app: Express;

const commentPayload: any = {
  comment: "This is a test comment",
};

describe("Comments Tests", () => {
  let accessToken = "";
  let commentId = "";
  let postId = "";
  let userId = "";

  beforeAll(async () => {
    app = await initApp();
    await commentsModel.deleteMany();
    await postsModel.deleteMany();

const uniqueEmail = `comment+${Date.now()}@user.com`;
const resRegister = await request(app).post("/api/users/register").send({
  username: "commentUser",
  email: uniqueEmail,
  password: "test1234",
});


    console.log("Register Response Body:", resRegister.body);
    console.log("Register Status Code:", resRegister.statusCode);

    if (!resRegister.body.accessToken || !resRegister.body.user?._id) {
      throw new Error("Registration failed – accessToken or userId missing");
    }

    accessToken = resRegister.body.accessToken;
    userId = resRegister.body.user._id;

    const newPost = await postsModel.create({
      title: "Test Post",
      content: "This is a test post",
      userId: new mongoose.Types.ObjectId(userId),
      owner: new mongoose.Types.ObjectId(userId),
    });

    postId = newPost._id.toString();
    commentPayload.postId = postId;
  });

  afterAll((done) => {
    mongoose.connection.close();
    done();
  });

  test("Create Comment", async () => {
    const response = await request(app)
      .post("/api/comments")
      .set("Authorization", "Bearer " + accessToken)
      .send(commentPayload);

    expect(response.statusCode).toBe(201);
    expect(response.body.comment).toBe(commentPayload.comment);
    commentId = response.body._id || ""; // שמירה למחיקה
  });

  test("Fail Create Comment without token", async () => {
    const response = await request(app)
      .post("/api/comments")
      .send(commentPayload);

    expect(response.statusCode).toBe(401);
  });

  test("Fail Create Comment with missing fields", async () => {
    const response = await request(app)
      .post("/api/comments")
      .set("Authorization", "Bearer " + accessToken)
      .send({ postId }); // חסר comment

    expect(response.statusCode).toBe(400);
  });

  test("Get Comments By Post ID", async () => {
    const response = await request(app)
      .get("/api/comments/" + postId);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].comment).toBe(commentPayload.comment);
  });

  test("Get Comments for nonexistent post ID", async () => {
    const fakePostId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .get("/api/comments/" + fakePostId);

    expect(response.statusCode).toBe(404);
  });

  test("Delete Comment", async () => {
    const response = await request(app)
      .delete("/api/comments/" + commentId)
      .set("Authorization", "Bearer " + accessToken);

    expect(response.statusCode).toBe(200);
  });
});
