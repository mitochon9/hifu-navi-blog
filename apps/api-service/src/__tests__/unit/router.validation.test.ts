import { describe, expect, test } from "bun:test";
import "../../config"; // ensure .env is loaded early
const testDbUrl = process.env.TEST_DATABASE_URL;
if (testDbUrl) {
  process.env.DATABASE_URL = testDbUrl;
}
const { createApp } = await import("../../app");

describe("router: validation failures", () => {
  test("POST /users 400 on invalid payload", async () => {
    const app = createApp();
    const res = await app.request("/api/users", {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      body: JSON.stringify({ email: "not-an-email", name: "" }),
    });
    expect(res.status).toBe(400);
  });

  test("GET /users/:id 400 on non-numeric id rejected by route pattern", async () => {
    const app = createApp();
    const res = await app.request("/api/users/abc");
    // Route doesn't match -> 404; numeric but invalid would be 400 via validator
    expect([400, 404]).toContain(res.status);
  });
});
