import type { PrismaClient } from "@repo/db";
import { err, ok, type Result } from "@repo/result";
import type { User } from "../domain/models";
import type { UsersRepository as DomainUsersRepository } from "../domain/users.repository";
import { mapDbUserToDomain } from "./mappers";

export function createUsersRepository(deps: { prisma: PrismaClient }): DomainUsersRepository {
  const { prisma } = deps;

  return {
    async list(): Promise<User[]> {
      const rows = await prisma.user.findMany({ orderBy: { id: "desc" } });
      return rows.map(mapDbUserToDomain);
    },
    async create(input: {
      email: string;
      name: string | null;
    }): Promise<Result<User, "Conflict" | "Unexpected">> {
      try {
        const row = await prisma.user.create({ data: input });
        return ok(mapDbUserToDomain(row));
      } catch (e: unknown) {
        if (
          typeof e === "object" &&
          e !== null &&
          "code" in e &&
          // Narrow to a minimal shape we need
          (e as { code?: string }).code === "P2002"
        ) {
          return err("Conflict");
        }
        return err("Unexpected");
      }
    },
    async getById(id: number): Promise<User | null> {
      const row = await prisma.user.findUnique({ where: { id } });
      return row ? mapDbUserToDomain(row) : null;
    },
  };
}
