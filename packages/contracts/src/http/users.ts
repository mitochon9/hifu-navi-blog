import { z } from "zod";

export const CreateUserRequestSchema = z.object({
  email: z.email(),
  name: z.string().min(1).max(100).nullable(),
});

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;

export const UsersListItemSchema = z.object({
  id: z.number().int(),
  email: z.email(),
  name: z.string().nullable(),
});

export const UsersListResponseSchema = z.object({
  items: z.array(UsersListItemSchema),
});

export type UsersListResponse = z.infer<typeof UsersListResponseSchema>;
