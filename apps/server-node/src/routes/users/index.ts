import { sValidator } from "@hono/standard-validator";
import { CreateUserRequestSchema, UsersListResponseSchema } from "@repo/contracts";
import { Hono } from "hono";
import { z } from "zod";
import type { UsersService } from "../../features/users/application/service";
import { toHttp } from "../../shared/http";

export function createUsersRouter(cntr: { users: UsersService }) {
  const app = new Hono()
    .get("/", async (c) => {
      const result = await cntr.users.listUsers();
      const { status, body } = toHttp(result);
      if (status === 200) {
        const parsed = UsersListResponseSchema.safeParse(body);
        if (!parsed.success) {
          return c.json({ message: "unexpected" }, 500);
        }
        return c.json(parsed.data, status);
      }
      return c.json(body, status);
    })
    .post("/", sValidator("json", CreateUserRequestSchema), async (c) => {
      const body = c.req.valid("json");
      const result = await cntr.users.createUser({
        email: body.email,
        name: body.name ?? null,
      });
      const { status, body: resBody } = toHttp(result, 201);
      return c.json(resBody, status);
    })
    .get(
      "/:id{[0-9]+}",
      sValidator("param", z.object({ id: z.coerce.number().int().positive() }).strict()),
      async (c) => {
        const { id } = c.req.valid("param");
        const result = await cntr.users.getUser(id);
        const { status, body } = toHttp(result);
        return c.json(body, status);
      }
    );

  return app;
}
