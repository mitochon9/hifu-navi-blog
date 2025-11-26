import { describe, expect, test } from "bun:test";
import { ok } from "@repo/result";
import { reconstituteUser } from "../../domain/models";
import type { UsersRepository } from "../../domain/users.repository";
import { makeGetUserStep } from "./steps";

describe("users.get steps", () => {
  test("ok: returns user when found", async () => {
    const mockUser = reconstituteUser({
      id: 1,
      email: "test@example.com",
      name: "Test User",
    });
    const usersRepository: UsersRepository = {
      list: async () => [],
      create: async () => ok(mockUser),
      getById: async () => mockUser,
    };
    const step = makeGetUserStep({ usersRepository });
    const r = await step(1);
    expect(r.type).toBe("ok");
    if (r.type === "ok") {
      expect(r.value).toEqual(mockUser);
    }
  });

  test("ok: returns user with null name", async () => {
    const mockUser = reconstituteUser({
      id: 2,
      email: "test2@example.com",
      name: null,
    });
    const usersRepository: UsersRepository = {
      list: async () => [],
      create: async () => ok(mockUser),
      getById: async () => mockUser,
    };
    const step = makeGetUserStep({ usersRepository });
    const r = await step(2);
    expect(r.type).toBe("ok");
    if (r.type === "ok") {
      expect(r.value).toEqual(mockUser);
    }
  });

  test("err: NotFound when user not found", async () => {
    const usersRepository: UsersRepository = {
      list: async () => [],
      create: async () => ok(reconstituteUser({ id: 0, email: "dummy@example.com", name: null })),
      getById: async () => null,
    };
    const step = makeGetUserStep({ usersRepository });
    const r = await step(999);
    expect(r.type).toBe("err");
    if (r.type === "err") {
      expect(r.value).toBe("NotFound");
    }
  });
});
