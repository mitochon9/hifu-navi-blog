import { err, ok, type Result } from "@repo/result";
import type { JobStatus, TasksRepository } from "../../domain/tasks.repository";

type FetchJobStepInput = { id: string };
type FetchJobStepOutput = Result<
  {
    id: string;
    status: JobStatus;
    result?: { message: string; finishedAt: string };
  },
  "NotFound" | "Unexpected"
>;

export function makeFetchJobStep(deps: { tasksRepository: TasksRepository }) {
  const { tasksRepository } = deps;
  return async function fetchJobStep(i: FetchJobStepInput): Promise<FetchJobStepOutput> {
    try {
      const job = await tasksRepository.getJob(i.id);
      if (!job) {
        return err("NotFound");
      }
      return ok({
        id: job.id,
        status: job.status,
        result: job.result,
      });
    } catch {
      return err("Unexpected");
    }
  };
}
