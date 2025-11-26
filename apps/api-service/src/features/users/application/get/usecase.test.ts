import { describe, expect, test } from "bun:test";
import { ok } from "@repo/result";
import { reconstituteUser } from "../../domain/models";
import type { UsersRepository } from "../../domain/users.repository";
import { makeGetUser } from "./usecase";

describe("users.get usecase", () => {
  test("ok: returns user successfully", async () => {
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
    const usecase = makeGetUser({ usersRepository });
    const r = await usecase(1);
    expect(r.type).toBe("ok");
    if (r.type === "ok") {
      expect(r.value.item).toEqual(mockUser);
    }
  });

  test("err: NotFound when user not found", async () => {
    const usersRepository: UsersRepository = {
      list: async () => [],
      create: async () => ok(reconstituteUser({ id: 0, email: "dummy@example.com", name: null })),
      getById: async () => null,
    };
    const usecase = makeGetUser({ usersRepository });
    const r = await usecase(999);
    expect(r.type).toBe("err");
    if (r.type === "err") {
      expect(r.value).toBe("NotFound");
    }
  });
});
