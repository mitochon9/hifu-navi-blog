import { AsyncBoundary } from "@repo/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskMetricsLoader } from "@/features/tasks";
import { CreateUserForm, UsersList } from "@/features/users";
import { cn } from "@/shared/lib/utils";
import { EchoForm } from "./echo-form";
import { UsersListSkeleton } from "./users-list-skeleton";

type ServerDemoProps = {
  className?: string;
};

export async function ServerDemo({ className }: ServerDemoProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Create user (Server Action)
          </h3>
          <CreateUserForm />
        </section>

        <div className="border-t border-zinc-200 dark:border-zinc-800" />

        <section className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Users list</h3>
          <AsyncBoundary
            fallback={<UsersListSkeleton />}
            errorFallback={<span className="text-sm text-red-600">Failed to load users.</span>}
          >
            <UsersList />
          </AsyncBoundary>
        </section>

        <div className="border-t border-zinc-200 dark:border-zinc-800" />

        <section className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Task metrics</h3>
          <AsyncBoundary
            fallback={<div className="text-sm text-zinc-500">Loading...</div>}
            errorFallback={
              <span className="text-sm text-red-600">Failed to load task metrics.</span>
            }
          >
            <TaskMetricsLoader />
          </AsyncBoundary>
        </section>

        <div className="border-t border-zinc-200 dark:border-zinc-800" />

        <section className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Echo API (validateJsonRequest sample)
          </h3>
          <EchoForm />
        </section>
      </CardContent>
    </Card>
  );
}
