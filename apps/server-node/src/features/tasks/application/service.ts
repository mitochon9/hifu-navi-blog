import type { TasksRepository } from "../domain/tasks.repository";
import {
  makeEnqueueTask,
  makeGetMetrics,
  makeGetStatus,
  makeMarkDone,
  makeMarkProcessing,
} from "./index";
import type { TaskDispatcher } from "./ports";

export type TasksService = ReturnType<typeof createTasksService>;

export function createTasksService(deps: {
  tasksRepository: TasksRepository;
  dispatcher: TaskDispatcher;
  callbackBaseUrl: string;
}) {
  const { tasksRepository, dispatcher, callbackBaseUrl } = deps;
  const enqueue = () =>
    makeEnqueueTask({
      tasksRepository,
      dispatcher,
      callbackBaseUrl,
    })();
  const getStatus = makeGetStatus({ tasksRepository });
  const markProcessing = makeMarkProcessing({ tasksRepository });
  const markDone = makeMarkDone({ tasksRepository });
  const getMetrics = () => makeGetMetrics({ tasksRepository })(null);
  return { enqueue, getStatus, markProcessing, markDone, getMetrics };
}
