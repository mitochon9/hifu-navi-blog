import { describe, expect, test } from "bun:test";
import "./config"; // ensure .env is loaded early
const testDbUrl = process.env.TEST_DATABASE_URL;
if (testDbUrl) {
  process.env.DATABASE_URL = testDbUrl;
}
const { createApp } = await import("./app");

describe("unit: core routes", () => {
  test("GET / returns ok", async () => {
    const app = createApp();
    const res = await app.request("/");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  test("GET /health", async () => {
    const app = createApp();
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("ok");
  });

  test("GET /unknown -> 404", async () => {
    const app = createApp();
    const res = await app.request("/unknown");
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.ok).toBe(false);
  });

  test("GET /boom -> 500 (onError)", async () => {
    const app = createApp();
    app.get("/boom", () => {
      throw new Error("boom");
    });
    const res = await app.request("/boom");
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.ok).toBe(false);
  });
});
