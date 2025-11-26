import { prisma as prismaClient } from "@repo/db";
import type { AppConfig } from "./config";
import { createTasksService } from "./features/tasks/application/service";
import { createTaskDispatcher } from "./features/tasks/infrastructure/task-dispatcher";
import { createTasksRepositoryPrisma } from "./features/tasks/infrastructure/tasks.repository.prisma";
import { createUsersService } from "./features/users/application/service";
import { createUsersRepository } from "./features/users/infrastructure/users.repository.prisma";

export function createContainer(config: AppConfig) {
  const prisma = prismaClient;

  const usersRepository = createUsersRepository({ prisma });
  const users = createUsersService({ usersRepository });

  const tasksRepository = createTasksRepositoryPrisma({ prisma });
  const workerBaseUrl = config.workerBaseUrl;
  const serverInternalUrl = config.serverInternalUrl;
  const cloudTasks = config.cloudTasks;
  const dispatcher = createTaskDispatcher({
    workerBaseUrl,
    cloudTasks,
  });

  const tasks = createTasksService({
    tasksRepository,
    dispatcher,
    callbackBaseUrl: serverInternalUrl,
  });

  return { users, tasks };
}
