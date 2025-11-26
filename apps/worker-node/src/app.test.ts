import { describe, expect, test } from "bun:test";

import { createApp } from "./app";

describe("worker: basic endpoints", () => {
  test("GET /health -> 200 and { status: 'ok' }", async () => {
    const app = createApp();
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    const json = (await res.json()) as { status: string };
    expect(json.status).toBe("ok");
  });

  test("GET / -> 200 and greeting payload", async () => {
    const app = createApp();
    const res = await app.request("/");
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean; message: string };
    expect(json.ok).toBe(true);
    expect(json.message).toContain("Hello Worker!");
  });
});
