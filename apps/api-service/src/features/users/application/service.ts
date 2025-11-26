import type { UsersRepository } from "../domain/users.repository";
import { makeCreateUser, makeGetUser, makeListUsers } from "./index";

export type UsersService = ReturnType<typeof createUsersService>;

export function createUsersService(deps: { usersRepository: UsersRepository }) {
  const { usersRepository } = deps;

  const listUsers = makeListUsers({ usersRepository });
  const createUser = makeCreateUser({ usersRepository });
  const getUser = makeGetUser({ usersRepository });

  return { listUsers, createUser, getUser };
}
