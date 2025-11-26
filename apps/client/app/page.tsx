import type { Metadata } from "next";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { fetchHello } from "@/shared/lib/api-client";
import { cn } from "@/shared/lib/utils";

export const metadata: Metadata = {
  title: "Home",
  description: "ax-saas-template のホームページ",
};

export default async function Home() {
  let apiData = null;
  let error = null;

  try {
    apiData = await fetchHello();
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        {apiData && (
          <Card className={cn("mt-4 p-4")}>
            <h2 className="text-lg font-semibold mb-2">API Service Response</h2>
            <p className="text-sm">{apiData.message}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(apiData.timestamp).toLocaleString("ja-JP")}
            </p>
          </Card>
        )}
        {error && (
          <Card className={cn("mt-4 p-4 border-red-500")}>
            <p className="text-sm text-red-500">Error: {error}</p>
          </Card>
        )}
      </main>
    </div>
  );
}
