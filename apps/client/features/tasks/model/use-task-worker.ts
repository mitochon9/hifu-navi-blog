import { useState } from "react";
import { enqueueTask } from "../actions/enqueue";
import { revalidateTaskMetrics } from "../actions/revalidate-metrics";
import { getTaskMetrics } from "../queries/get-metrics";
import { getTaskStatus } from "../queries/get-status";

type JobStatus = "queued" | "processing" | "done";

type TaskResult = {
  message: string;
  finishedAt: string;
};

export function useTaskWorker(initialTotalDone: number | null) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [result, setResult] = useState<TaskResult | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalDone, setTotalDone] = useState<number | null>(initialTotalDone);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setIsStarting(true);
    setError(null);
    try {
      const res = await enqueueTask();
      if (res.type === "err") {
        setError(`Failed to enqueue task: ${res.value}`);
        return;
      }
      setJobId(res.value.jobId);
      setStatus("queued");
      setResult(null);
    } catch (error) {
      setError(`Error starting task: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsStarting(false);
    }
  }

  async function refresh() {
    if (!jobId || isRefreshing) {
      return;
    }
    setIsRefreshing(true);
    setError(null);
    try {
      const res = await getTaskStatus(jobId);
      if (!res.ok) {
        setError("Failed to get task status");
        return;
      }
      setStatus(res.data.status);
      setResult(res.data.result ?? null);
      if (res.data.status === "done") {
        await revalidateTaskMetrics();
        const m = await getTaskMetrics();
        if (m.ok) {
          setTotalDone(m.data.totalDone);
        } else {
          setError("Failed to get task metrics");
        }
      }
    } catch (error) {
      setError(
        `Error refreshing task status: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsRefreshing(false);
    }
  }

  return {
    jobId,
    status,
    result,
    isStarting,
    isRefreshing,
    totalDone,
    error,
    start,
    refresh,
  };
}
