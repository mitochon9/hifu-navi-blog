import { describe, expect, test } from "bun:test";
import { err, ok } from "@repo/result";
import { reconstituteUser } from "../../domain/models";
import type { UsersRepository } from "../../domain/users.repository";
import { makeCreateUser } from "./usecase";

describe("users.create usecase", () => {
  test("ok: creates user with valid input", async () => {
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
    const usecase = makeCreateUser({ usersRepository });
    const r = await usecase({
      email: "test@example.com",
      name: "Test User",
    });
    expect(r.type).toBe("ok");
    if (r.type === "ok") {
      expect(r.value.item.id).toBe(1);
    }
  });

  test("err: Invalid when validation fails", async () => {
    const usersRepository: UsersRepository = {
      list: async () => [],
      create: async () => ok(reconstituteUser({ id: 1, email: "dummy@example.com", name: null })),
      getById: async () => null,
    };
    const usecase = makeCreateUser({ usersRepository });
    const r = await usecase({
      email: "invalid-email",
      name: "User",
    });
    expect(r.type).toBe("err");
    if (r.type === "err") {
      expect(r.value).toBe("Invalid");
    }
  });

  test("err: Conflict when email already exists", async () => {
    const usersRepository: UsersRepository = {
      list: async () => [],
      create: async () => err("Conflict"),
      getById: async () => null,
    };
    const usecase = makeCreateUser({ usersRepository });
    const r = await usecase({
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
    const usecase = makeCreateUser({ usersRepository });
    const r = await usecase({
      email: "test@example.com",
      name: "User",
    });
    expect(r.type).toBe("err");
    if (r.type === "err") {
      expect(r.value).toBe("Unexpected");
    }
  });
});
