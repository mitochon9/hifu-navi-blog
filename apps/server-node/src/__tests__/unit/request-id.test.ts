import { describe, expect, test } from "bun:test";
import "../../config"; // ensure .env is loaded early
const testDbUrl = process.env.TEST_DATABASE_URL;
if (testDbUrl) {
  process.env.DATABASE_URL = testDbUrl;
}
const { createApp } = await import("../../app");

describe("request-id header", () => {
  test("all responses include x-request-id header", async () => {
    const app = createApp();
    const res = await app.request("/");
    expect(res.headers.has("x-request-id")).toBe(true);
  });
});
