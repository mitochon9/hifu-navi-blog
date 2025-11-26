"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type TaskControlsProps = {
  jobId: string | null;
  status: string | null;
  isStarting: boolean;
  isRefreshing: boolean;
  onStart: () => void;
  onRefresh: () => void;
};

export function TaskControls({
  jobId,
  status,
  isStarting,
  isRefreshing,
  onStart,
  onRefresh,
}: TaskControlsProps) {
  const buttonLabel = (() => {
    if (!jobId) {
      return "Start sample job";
    }
    if (status === "queued") {
      return "Queued...";
    }
    if (status === "processing") {
      return "Processing (wait ~3s)...";
    }
    return "Start sample job";
  })();

  return (
    <div>
      <Button onClick={onStart} disabled={isStarting || (!!jobId && status !== "done")}>
        {isStarting ? "Starting..." : buttonLabel}
      </Button>
      <Button
        className="ml-2"
        variant="secondary"
        onClick={onRefresh}
        disabled={!jobId || isRefreshing}
      >
        {isRefreshing ? (
          <>
            <Spinner />
            Refreshing...
          </>
        ) : (
          "Refresh"
        )}
      </Button>
      {jobId ? (
        <span className="ml-3 text-sm text-zinc-600 dark:text-zinc-400">
          Job: <span className="font-mono">{jobId}</span>
        </span>
      ) : null}
    </div>
  );
}
