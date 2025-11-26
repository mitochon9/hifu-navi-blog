import { enqueueHttpTask } from "@app/integrations/cloud-tasks";
import { err, ok, type Result } from "@repo/result";
import type { TaskDispatcher } from "../application/ports";

/**
 * Cloud Tasks (または直接HTTP) へのタスク投入を行うディスパッチャー
 *
 * Dispatcherパターンを採用する理由 (vs Pub/Sub):
 * 1. 明確なCommand意図: "イベント"ではなく"タスク実行"という具体的な指示であるため、宛先(Worker)を意識した直接投入が適切。
 * 2. 制御可能性: Cloud Tasksの機能（レート制限、リトライ制御、重複排除）を直接活用するため。
 * 3. シンプルさ: タスク実行においては「投げっぱなし」のPub/Subよりも、成功/失敗の結果をハンドリングしやすい。
 */
export function createTaskDispatcher(deps: {
  workerBaseUrl: string;
  fetchFn?: typeof fetch;
  cloudTasks?: {
    projectId: string;
    location: string;
    queue: string;
    serviceAccountEmail?: string;
  };
}): TaskDispatcher {
  const { workerBaseUrl, fetchFn = fetch, cloudTasks } = deps;

  return {
    async enqueue(i: { jobId: string; callbackUrl: string }): Promise<Result<void, "Unexpected">> {
      try {
        const workerUrl = `${workerBaseUrl}/tasks/enqueue`;

        if (cloudTasks) {
          await enqueueHttpTask({
            projectId: cloudTasks.projectId,
            location: cloudTasks.location,
            queue: cloudTasks.queue,
            url: workerUrl,
            json: { jobId: i.jobId, callbackUrl: i.callbackUrl },
            serviceAccountEmail: cloudTasks.serviceAccountEmail,
          });
        } else {
          const res = await fetchFn(workerUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobId: i.jobId, callbackUrl: i.callbackUrl }),
            signal: AbortSignal.timeout(1000),
          });
          if (!res.ok) {
            const errorText = await res.text().catch(() => "Failed to read error");
            console.error(
              JSON.stringify({
                error: "Failed to enqueue task via direct fetch",
                evt: "enqueue_fetch_error",
                mod: "tasks",
                jobId: i.jobId,
                workerUrl,
                status: res.status,
                statusText: res.statusText,
                errorText,
              })
            );
            return err("Unexpected");
          }
        }
        return ok(undefined);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error(
          JSON.stringify({
            error: "Failed to enqueue task",
            evt: "enqueue_error",
            mod: "tasks",
            jobId: i.jobId,
            message: errorMessage,
            stack: errorStack,
            workerUrl: `${workerBaseUrl}/tasks/enqueue`,
          })
        );
        return err("Unexpected");
      }
    },
  };
}
