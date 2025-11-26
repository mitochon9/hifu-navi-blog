import { describe, expect, test } from "bun:test";
import { isOk } from "@repo/result";
import { type Email, makeEmail, makeUserName, type UserName } from "./models";

describe("User Domain Models", () => {
  describe("Email", () => {
    test("valid email should be accepted", () => {
      const result = makeEmail("test@example.com");
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        const email: Email = result.value;
        expect(email as string).toBe("test@example.com");
      }
    });

    test("invalid email should be rejected", () => {
      const result = makeEmail("invalid-email");
      expect(isOk(result)).toBe(false);
    });

    test("email with whitespace should be trimmed", () => {
      const result = makeEmail("  test@example.com  ");
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value as string).toBe("test@example.com");
      }
    });
  });

  describe("UserName", () => {
    test("valid username should be accepted", () => {
      const result = makeUserName("Alice");
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        const name: UserName | null = result.value;
        expect(name as string).toBe("Alice");
      }
    });

    test("null username should be accepted", () => {
      const result = makeUserName(null);
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toBe(null);
      }
    });

    test("empty username should be rejected", () => {
      const result = makeUserName("");
      expect(isOk(result)).toBe(false);
    });

    test("too long username should be rejected", () => {
      const longName = "a".repeat(101);
      const result = makeUserName(longName);
      expect(isOk(result)).toBe(false);
    });
  });
});
