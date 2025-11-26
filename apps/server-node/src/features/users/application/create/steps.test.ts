import { describe, expect, test } from "bun:test";
import { err, ok } from "@repo/result";
import { reconstituteUser } from "../../domain/models";
import type { UsersRepository } from "../../domain/users.repository";
import { makeCreateUserStep } from "./steps";

describe("users.create steps", () => {
  test("ok: creates user successfully", async () => {
    const mockUser = reconstituteUser({
      id: 1,
      email: "test@example.com",
      name: "Test User",
    });
    const usersRepository: UsersRepository = {
      list: async () => [],
      create: async () => ok(mockUser),
      getById: async () => null,
    };
    const step = makeCreateUserStep({ usersRepository });
    const r = await step({
      email: "test@example.com",
      name: "Test User",
    });
    expect(r.type).toBe("ok");
    if (r.type === "ok") {
      expect(r.value.id).toBe(1);
    }
  });

  test("ok: creates user with null name", async () => {
    const mockUser = reconstituteUser({
      id: 2,
      email: "test2@example.com",
      name: null,
    });
    const usersRepository: UsersRepository = {
      list: async () => [],
      create: async () => ok(mockUser),
      getById: async () => null,
    };
    const step = makeCreateUserStep({ usersRepository });
    const r = await step({
      email: "test2@example.com",
      name: null,
    });
    expect(r.type).toBe("ok");
    if (r.type === "ok") {
      expect(r.value.id).toBe(2);
    }
  });

  test("err: Conflict when email already exists", async () => {
    const usersRepository: UsersRepository = {
      list: async () => [],
      create: async () => err("Conflict"),
      getById: async () => null,
    };
    const step = makeCreateUserStep({ usersRepository });
    const r = await step({
      email: "existing@example.com",
      name: "User",
    });
    expect(r.type).toBe("err");
    if (r.type === "err") {
      expect(r.value).toBe("Conflict");
    }
  });

  test("err: Unexpected when repository returns Unexpected", async () => {
    const usersRepository: UsersRepository = {
      list: async () => [],
      create: async () => err("Unexpected"),
      getById: async () => null,
    };
    const step = makeCreateUserStep({ usersRepository });
    const r = await step({
      email: "test@example.com",
      name: "User",
    });
    expect(r.type).toBe("err");
    if (r.type === "err") {
      expect(r.value).toBe("Unexpected");
    }
  });
});
