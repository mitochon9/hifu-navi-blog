import type { PrismaClient } from "@repo/db";
import type { Job, JobStatus, TaskResult, TasksRepository } from "../domain/tasks.repository";

/**
 * 文字列が有効なJobStatusかどうかをチェックする型ガード
 */
function isValidJobStatus(value: string): value is JobStatus {
  return value === "queued" || value === "processing" || value === "done";
}

function isRecordNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2025"
  );
}

function mapRowToDomain(row: {
  id: string;
  status: string;
  message: string | null;
  finishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): Job {
  if (!isValidJobStatus(row.status)) {
    throw new Error(`Invalid job status: ${row.status}`);
  }
  let result: TaskResult | undefined;
  if (row.message) {
    if (!row.finishedAt) {
      throw new Error(`Task result missing finishedAt for job ${row.id}`);
    }
    result = {
      message: row.message,
      finishedAt: row.finishedAt.toISOString(),
    };
  }
  return {
    id: row.id,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    ...(result ? { result } : {}),
  };
}

export function createTasksRepositoryPrisma(deps: { prisma: PrismaClient }): TasksRepository {
  const { prisma } = deps;
  return {
    async createJob() {
      const id = crypto.randomUUID();
      const row = await prisma.taskJob.create({
        data: { id, status: "queued" },
      });
      return mapRowToDomain(row);
    },
    async getJob(id: string) {
      const row = await prisma.taskJob.findUnique({ where: { id } });
      return row ? mapRowToDomain(row) : null;
    },
    async markProcessing(id: string) {
      try {
        const row = await prisma.taskJob.update({
          where: { id },
          data: { status: "processing" },
        });
        return mapRowToDomain(row);
      } catch (error) {
        if (isRecordNotFoundError(error)) {
          return null;
        }
        throw error;
      }
    },
    async markDone(id: string, result: TaskResult) {
      try {
        const row = await prisma.taskJob.update({
          where: { id },
          data: {
            status: "done",
            message: result.message,
            finishedAt: new Date(result.finishedAt),
          },
        });
        return mapRowToDomain(row);
      } catch (error) {
        if (isRecordNotFoundError(error)) {
          return null;
        }
        throw error;
      }
    },
    async countDone() {
      return prisma.taskJob.count({ where: { status: "done" } });
    },
  };
}
