"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type EchoResponse = {
  echo: string;
  receivedAt: string;
  serverTime: string;
};

export function EchoForm() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<EchoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/echo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { errors?: string[] };
        setError(data.errors?.join(", ") ?? "Failed to echo");
        return;
      }

      const data = (await res.json()) as EchoResponse;
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to echo");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter a message to echo"
        required
        minLength={1}
        maxLength={1000}
        className="w-full rounded-md border px-3 py-2 text-sm dark:bg-input/30 dark:border-input"
      />
      {error ? (
        <div className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </div>
      ) : null}
      {response ? (
        <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-3 text-sm space-y-1">
          <div className="font-medium text-zinc-900 dark:text-zinc-100">{response.echo}</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Received: {response.receivedAt}
          </div>
        </div>
      ) : null}
      <div>
        <Button type="submit" disabled={isLoading || !message.trim()}>
          {isLoading ? "Sending..." : "Echo"}
        </Button>
      </div>
    </form>
  );
}
