import { describe, expect, test } from "bun:test";
import { hc } from "hono/client";
import type { AppType } from "../../types";

describe("contract: client type smoke", () => {
  test("hc<AppType> compiles (runtime smoke)", async () => {
    const client = hc<AppType>("/");
    expect(typeof client).toBe("function");
  });
});
