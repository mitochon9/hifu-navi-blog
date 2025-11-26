import type { Metadata } from "next";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { cn } from "@/shared/lib/utils";

export const metadata: Metadata = {
  title: "Home",
  description: "ax-saas-template のホームページ",
};

export default async function Home() {
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
        <Card className={cn("p-4")}>Hifu Navi Blog</Card>
      </main>
    </div>
  );
}
