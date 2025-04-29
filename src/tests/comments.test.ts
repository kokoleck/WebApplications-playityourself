import request from "supertest";
import initApp from "../app"; // ודאי שזה הנתיב הנכון לקובץ app.ts שלך

let app: any;

beforeAll(async () => {
  app = await initApp();
});

describe("Comments API", () => {
  it("should return all comments", async () => {
    const res = await request(app)
      .get("/api/comments")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  }, 10000); // נותן עד 10 שניות להריץ לפני טיימאאוט
});
