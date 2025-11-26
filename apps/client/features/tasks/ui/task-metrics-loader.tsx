import { getTaskMetrics } from "../queries/get-metrics";
import { WorkerDemo } from "./worker-demo";

export async function TaskMetricsLoader() {
  const metrics = await getTaskMetrics();
  if (!metrics.ok) {
    throw new Error("Failed to load task metrics");
  }
  return <WorkerDemo initialTotalDone={metrics.data.totalDone} />;
}
