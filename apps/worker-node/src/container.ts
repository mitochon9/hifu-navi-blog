import type { AppConfig } from "./config";
import { createTasksWorkerService } from "./features/tasks/application/service";
import { createTimerDelay } from "./features/tasks/infrastructure/delay.timer";
import { createHttpNotifier } from "./features/tasks/infrastructure/notifier.http";

export function createContainer(config: AppConfig) {
  const notifier = createHttpNotifier({ nodeEnv: config.nodeEnv });
  const delay = createTimerDelay();
  const tasks = createTasksWorkerService({ notifier, delay });

  return { tasks } as const;
}
