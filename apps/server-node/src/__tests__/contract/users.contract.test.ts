import { describe, expect, test } from "bun:test";
import {
  type CreateUserRequest,
  CreateUserRequestSchema,
  UsersListResponseSchema,
} from "@repo/contracts";
import { err, ok } from "@repo/result";
import { Hono } from "hono";
import type { UsersService } from "../../features/users/application/service";
import { reconstituteUser } from "../../features/users/domain/models";
import type { User } from "../../features/users/domain/users.repository";
import { createUsersRouter } from "../../routes/users";

const listItems: User[] = [
  reconstituteUser({
    id: 1,
    email: "alice@example.com",
    name: "Alice",
  }),
];

const stubService: UsersService = {
  listUsers: async () =>
    ok({
      items: listItems,
    }),
  createUser: async (input) => {
    const parsed = CreateUserRequestSchema.safeParse(input);
    if (!parsed.success) {
      return err("Invalid");
    }
    return ok({
      item: { id: 2 },
      events: [
        {
          type: "users/created" as const,
          payload: {
            id: 2,
            email: parsed.data.email,
            name: parsed.data.name ?? null,
            occurredAt: new Date().toISOString(),
          },
        },
      ],
    });
  },
  getUser: async () =>
    ok({
      item: listItems[0]!,
    }),
};

describe("contract: users routes", () => {
  const app = new Hono().route("/", createUsersRouter({ users: stubService }));

  test("GET / conforms to UsersListResponseSchema", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);
    const json = (await res.json()) as unknown;
    expect(() => UsersListResponseSchema.parse(json)).not.toThrow();
  });

  test("POST / enforces CreateUserRequestSchema", async () => {
    const payload: CreateUserRequest = {
      email: "bob@example.com",
      name: "Bob",
    };
    const res = await app.request("/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    expect(res.status).toBe(201);
    const json = (await res.json()) as { item: { id: number } };
    expect(json.item.id).toBe(2);
  });
});
