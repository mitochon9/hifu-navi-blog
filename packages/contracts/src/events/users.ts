import { z } from "zod";
import { CreateUserRequestSchema, UsersListItemSchema } from "../http/users";

const isoDateTimeSchema = z.iso.datetime({ offset: true });

export const UsersCreateCommandSchema = z.object({
  type: z.literal("users/create"),
  payload: CreateUserRequestSchema,
  issuedAt: isoDateTimeSchema,
});
export type UsersCreateCommand = z.infer<typeof UsersCreateCommandSchema>;

export const UsersCreatedEventSchema = z.object({
  type: z.literal("users/created"),
  payload: UsersListItemSchema.extend({
    occurredAt: isoDateTimeSchema,
  }),
});
export type UsersCreatedEvent = z.infer<typeof UsersCreatedEventSchema>;
