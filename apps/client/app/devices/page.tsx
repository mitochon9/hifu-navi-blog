import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlansForDevice, getPriceEntriesForPlan, getPublishedDevices } from "@/lib/mock";
import { cn } from "@/shared/lib/utils";

export const metadata: Metadata = {
  title: "HIFU機種一覧",
  description:
    "HIFU施術に使用される機種一覧。ウルセラ、ウルトラセルQ+、ダブロゴールドなど主要機種の特徴と相場を比較。",
};

function getDeviceStats(deviceId: string) {
  const plans = getPlansForDevice(deviceId);
  const clinicIds = new Set(plans.map((p) => p.clinicId));
  const allPrices = plans.flatMap((plan) =>
    getPriceEntriesForPlan(plan.id).map((pe) => pe.priceYen)
  );

  return {
    clinicCount: clinicIds.size,
    priceMin: allPrices.length > 0 ? Math.min(...allPrices) : null,
    priceMax: allPrices.length > 0 ? Math.max(...allPrices) : null,
  };
}

export default function DevicesPage() {
  const devices = getPublishedDevices();

  return (
    <div className="py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <nav className="mb-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              ホーム
            </Link>
            <span className="mx-2">/</span>
            <span>機種一覧</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            HIFU機種一覧
          </h1>
          <p className="mt-2 text-muted-foreground">
            主要なHIFU機種の特徴と取扱いクリニック数・価格帯を確認できます
          </p>
        </div>

        {/* Filter (placeholder for future) */}
        <div className="mb-6 flex flex-wrap gap-2">
          <FilterBadge active>すべて</FilterBadge>
          <FilterBadge>痛み少なめ</FilterBadge>
          <FilterBadge>高効果</FilterBadge>
          <FilterBadge>FDA承認</FilterBadge>
        </div>

        {/* Device Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {devices.map((device) => {
            const stats = getDeviceStats(device.id);
            return <DeviceCard key={device.id} device={device} stats={stats} />;
          })}
        </div>

        {/* Info Section */}
        <div className="mt-12 rounded-xl border border-border/60 bg-muted/30 p-6">
          <h2 className="font-semibold text-foreground">HIFU機種の選び方</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            HIFU（高密度焦点式超音波）機器は機種によって痛み・効果・持続期間が異なります。
            予算や希望する効果、痛みへの耐性に応じて最適な機種を選びましょう。
            詳細は各機種ページで取扱いクリニックと価格を確認できます。
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Sub Components
// ============================================

function FilterBadge({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-full px-3 py-1 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-background text-muted-foreground hover:bg-accent"
      )}
    >
      {children}
    </button>
  );
}

function DeviceCard({
  device,
  stats,
}: {
  device: ReturnType<typeof getPublishedDevices>[number];
  stats: { clinicCount: number; priceMin: number | null; priceMax: number | null };
}) {
  return (
    <Link href={`/devices/${device.slug}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{device.nameOfficial}</CardTitle>
              {device.aliases.length > 0 && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  別名: {device.aliases.slice(0, 2).join(", ")}
                </p>
              )}
            </div>
          </div>
          {device.manufacturer && (
            <p className="text-xs text-muted-foreground">{device.manufacturer}</p>
          )}
        </CardHeader>
        <CardContent>
          <p className="line-clamp-2 text-sm text-muted-foreground">{device.descriptionShort}</p>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-1">
            {device.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-4 text-sm">
            <div>
              <span className="text-muted-foreground">取扱院</span>
              <span className="ml-1 font-semibold text-foreground">{stats.clinicCount}院</span>
            </div>
            {stats.priceMin !== null && (
              <div className="text-right">
                <span className="text-muted-foreground">相場</span>
                <span className="ml-1 font-semibold text-foreground price-display">
                  ¥{stats.priceMin.toLocaleString()}〜
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
