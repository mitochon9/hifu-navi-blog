import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  getPlansForClinic,
  getPriceEntriesForPlan,
  getPublishedClinics,
  getPublishedDevices,
  PREFECTURE,
} from "@/lib/mock";

export const metadata: Metadata = {
  title: "クリニック一覧",
  description: "HIFU施術を受けられるクリニック一覧。エリア・機種・価格帯で絞り込み、比較できます。",
};

function getClinicStats(clinicId: string) {
  const plans = getPlansForClinic(clinicId);
  const deviceIds = new Set(plans.map((p) => p.deviceId));
  const allPrices = plans.flatMap((plan) =>
    getPriceEntriesForPlan(plan.id).map((pe) => pe.priceYen)
  );

  return {
    deviceCount: deviceIds.size,
    planCount: plans.length,
    priceMin: allPrices.length > 0 ? Math.min(...allPrices) : null,
  };
}

export default function ClinicsPage() {
  const clinics = getPublishedClinics().sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
  const devices = getPublishedDevices();

  // Group clinics by prefecture
  const prefectureCounts = clinics.reduce(
    (acc, clinic) => {
      acc[clinic.prefecture] = (acc[clinic.prefecture] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

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
            <span>クリニック一覧</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            クリニック一覧
          </h1>
          <p className="mt-2 text-muted-foreground">
            HIFU施術を受けられるクリニックをエリア・機種・価格帯で探せます
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Area Filter */}
              <div>
                <h3 className="mb-3 font-semibold text-foreground">エリア</h3>
                <div className="space-y-1">
                  {Object.entries(prefectureCounts).map(([pref, count]) => (
                    <button
                      key={pref}
                      type="button"
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <span>{PREFECTURE[pref as keyof typeof PREFECTURE]}</span>
                      <span className="text-xs">{count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Device Filter */}
              <div>
                <h3 className="mb-3 font-semibold text-foreground">機種</h3>
                <div className="space-y-1">
                  {devices.slice(0, 5).map((device) => (
                    <button
                      key={device.id}
                      type="button"
                      className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {device.nameOfficial}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="mb-3 font-semibold text-foreground">価格帯</h3>
                <div className="space-y-1">
                  {[
                    { label: "〜3万円", value: "0-30000" },
                    { label: "3〜5万円", value: "30000-50000" },
                    { label: "5〜10万円", value: "50000-100000" },
                    { label: "10万円〜", value: "100000-" },
                  ].map((range) => (
                    <button
                      key={range.value}
                      type="button"
                      className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Clinic List */}
          <div className="lg:col-span-3">
            {/* Sort & Count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{clinics.length}件のクリニック</p>
              <select className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground">
                <option value="updated">更新日順</option>
                <option value="price-low">価格が安い順</option>
                <option value="name">名前順</option>
              </select>
            </div>

            {/* Clinic Cards */}
            <div className="space-y-4">
              {clinics.map((clinic) => {
                const stats = getClinicStats(clinic.id);
                return <ClinicCard key={clinic.id} clinic={clinic} stats={stats} />;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Sub Components
// ============================================

function ClinicCard({
  clinic,
  stats,
}: {
  clinic: ReturnType<typeof getPublishedClinics>[number];
  stats: {
    deviceCount: number;
    planCount: number;
    priceMin: number | null;
  };
}) {
  return (
    <Link href={`/clinics/${clinic.slug}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{clinic.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{clinic.nearestStation}</p>
              {clinic.descriptionShort && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {clinic.descriptionShort}
                </p>
              )}

              {/* Stats */}
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span>対応機種: {stats.deviceCount}種</span>
                <span>プラン数: {stats.planCount}</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              {stats.priceMin !== null && (
                <div className="text-right">
                  <span className="text-lg font-bold text-foreground price-display">
                    ¥{stats.priceMin.toLocaleString()}
                  </span>
                  <span className="ml-1 text-xs text-muted-foreground">〜</span>
                </div>
              )}
              <span className="text-xs text-muted-foreground">
                更新: {clinic.updatedAt.toLocaleDateString("ja-JP")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
