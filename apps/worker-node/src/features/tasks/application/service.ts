import type { DelayPort } from "../domain/delay.port";
import type { TasksNotifierPort } from "../domain/notifier.port";
import { makeProcessTask } from "./process/usecase";

export type TasksWorkerService = ReturnType<typeof createTasksWorkerService>;

export function createTasksWorkerService(deps: { notifier: TasksNotifierPort; delay: DelayPort }) {
  const { notifier, delay } = deps;
  const processTask = makeProcessTask({
    notifyProcessing: notifier.notifyProcessing,
    notifyDone: notifier.notifyDone,
    delayMs: delay.delayMs,
  });
  return { processTask };
}
