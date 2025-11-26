import { describe, expect, test } from "bun:test";
import { ok } from "@repo/result";
import { reconstituteUser } from "../../domain/models";
import type { UsersRepository } from "../../domain/users.repository";
import { makeFetchUsersStep } from "./steps";

describe("users.list steps", () => {
  test("ok: returns users from repository", async () => {
    const mockUsers = [
      reconstituteUser({ id: 1, email: "a@example.com", name: "Alice" }),
      reconstituteUser({ id: 2, email: "b@example.com", name: null }),
    ];
    const usersRepository: UsersRepository = {
      list: async () => mockUsers,
      create: async () => ok(reconstituteUser({ id: 0, email: "dummy@example.com", name: null })),
      getById: async () => null,
    };
    const step = makeFetchUsersStep({ usersRepository });
    const r = await step(null);
    expect(r.type).toBe("ok");
    if (r.type === "ok") {
      expect(r.value).toEqual(mockUsers);
    }
  });

  test("ok: returns empty array when no users", async () => {
    const usersRepository: UsersRepository = {
      list: async () => [],
      create: async () => ok(reconstituteUser({ id: 0, email: "dummy@example.com", name: null })),
      getById: async () => null,
    };
    const step = makeFetchUsersStep({ usersRepository });
    const r = await step(null);
    expect(r.type).toBe("ok");
    if (r.type === "ok") {
      expect(r.value).toEqual([]);
    }
  });

  test("err: Unexpected when repository throws", async () => {
    const usersRepository: UsersRepository = {
      list: async () => {
        throw new Error("DB error");
      },
      create: async () => ok(reconstituteUser({ id: 0, email: "dummy@example.com", name: null })),
      getById: async () => null,
    };
    const step = makeFetchUsersStep({ usersRepository });
    const r = await step(null);
    expect(r.type).toBe("err");
    if (r.type === "err") {
      expect(r.value).toBe("Unexpected");
    }
  });
});
