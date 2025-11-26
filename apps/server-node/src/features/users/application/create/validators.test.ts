import { describe, expect, test } from "bun:test";
import { validateCreateUser } from "./validators";

describe("users.application validateCreateUser", () => {
  test("ok: valid payload", () => {
    const r = validateCreateUser({ email: "a@example.com", name: "Alice" });
    expect(r.type).toBe("ok");
    if (r.type === "ok") {
      expect(r.value).toEqual({ email: "a@example.com", name: "Alice" });
    }
  });

  test("ok: null name", () => {
    const r = validateCreateUser({
      email: "a@example.com",
      name: null,
    });
    expect(r.type).toBe("ok");
    if (r.type === "ok") {
      expect(r.value).toEqual({ email: "a@example.com", name: null });
    }
  });

  test("invalid: malformed email", () => {
    const r = validateCreateUser({ email: "not-an-email", name: "Alice" });
    expect(r.type).toBe("err");
    if (r.type === "err") {
      expect(r.value).toBe("Invalid");
    }
  });

  test("invalid: empty name after trim", () => {
    const r = validateCreateUser({ email: "a@example.com", name: "" });
    expect(r.type).toBe("err");
    if (r.type === "err") {
      expect(r.value).toBe("Invalid");
    }
  });

  test("invalid: whitespace-only name", () => {
    const r = validateCreateUser({ email: "a@example.com", name: "   " });
    expect(r.type).toBe("err");
    if (r.type === "err") {
      expect(r.value).toBe("Invalid");
    }
  });
});
