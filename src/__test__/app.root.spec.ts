import { app } from "../app";
import request from "supertest";

describe("Test the root path", () => {
  test("It should response the GET method", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Hello World! How do you feel ?');
  });
});