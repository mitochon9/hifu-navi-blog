"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTaskWorker } from "../model/use-task-worker";
import { TaskControls } from "./task-controls";
import { TaskInfo } from "./task-info";

export function WorkerDemo({ initialTotalDone }: { initialTotalDone: number | null }) {
  const { jobId, status, result, isStarting, isRefreshing, totalDone, error, start, refresh } =
    useTaskWorker(initialTotalDone);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Worker demo (Cloud Tasks)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TaskControls
          jobId={jobId}
          status={status}
          isStarting={isStarting}
          isRefreshing={isRefreshing}
          onStart={start}
          onRefresh={refresh}
        />
        <TaskInfo totalDone={totalDone} status={status} result={result} error={error} />
      </CardContent>
    </Card>
  );
}
