import { describe, expect, test } from "bun:test";
import { ok } from "@repo/result";
import { reconstituteUser } from "../../domain/models";
import type { UsersRepository } from "../../domain/users.repository";
import { makeListUsers } from "./usecase";

describe("users.list usecase", () => {
  test("ok: returns users successfully", async () => {
    const mockUsers = [
      reconstituteUser({ id: 1, email: "a@example.com", name: "Alice" }),
      reconstituteUser({ id: 2, email: "b@example.com", name: null }),
    ];
    const usersRepository: UsersRepository = {
      list: async () => mockUsers,
      create: async () => ok(reconstituteUser({ id: 0, email: "dummy@example.com", name: null })),
      getById: async () => null,
    };
    const usecase = makeListUsers({ usersRepository });
    const r = await usecase();
    expect(r.type).toBe("ok");
    if (r.type === "ok") {
      expect(r.value.items).toEqual(mockUsers);
    }
  });
});
