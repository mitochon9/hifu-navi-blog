import { describe, expect, test } from "bun:test";
import { err, ok } from "@repo/result";
import { makeCreateUser } from "../../features/users/application/create/usecase";
import { validateCreateUser } from "../../features/users/application/create/validators";
import { reconstituteUser, type User } from "../../features/users/domain/models";
import type { UsersRepository } from "../../features/users/domain/users.repository";

describe("scenario: users/create", () => {
  const baseUser = reconstituteUser({
    id: 42,
    email: "alice@example.com",
    name: "Alice",
  });

  const stubRepository: UsersRepository = {
    list: async () => [baseUser],
    create: async (input) =>
      ok<User>(reconstituteUser({ id: baseUser.id, email: input.email, name: input.name })),
    getById: async (id) => (id === baseUser.id ? baseUser : null),
  };

  test("creates user successfully", async () => {
    const createUser = makeCreateUser({ usersRepository: stubRepository });
    const result = await createUser({ email: "alice@example.com", name: "Alice" });
    expect(result.type).toBe("ok");
    if (result.type === "ok") {
      expect(result.value.item.id).toBe(baseUser.id);
    }
  });

  test("invalid user name fails validation", () => {
    const validation = validateCreateUser({
      email: "alice@example.com",
      name: "",
    });
    expect(validation).toEqual(err("Invalid"));
  });
});
