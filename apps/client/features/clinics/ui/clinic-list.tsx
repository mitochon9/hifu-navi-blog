import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Clinic, Device } from "@/lib/mock";
import { PREFECTURE } from "@/lib/mock";
import { ClinicCard } from "./clinic-card";
import { ClinicSortSelect } from "./clinic-sort-select";

type ClinicStats = {
  deviceCount: number;
  planCount: number;
  priceMin: number | null;
};

type ClinicListProps = {
  clinics: Clinic[];
  devices: Device[];
  getClinicStats: (clinicId: string) => ClinicStats;
};

export function ClinicList({ clinics, devices, getClinicStats }: ClinicListProps) {
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
                    <Button
                      key={pref}
                      type="button"
                      variant="ghost"
                      className="flex w-full items-center justify-between"
                    >
                      <span>{PREFECTURE[pref as keyof typeof PREFECTURE]}</span>
                      <span className="text-xs">{count}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Device Filter */}
              <div>
                <h3 className="mb-3 font-semibold text-foreground">機種</h3>
                <div className="space-y-1">
                  {devices.slice(0, 5).map((device) => (
                    <Button
                      key={device.id}
                      type="button"
                      variant="ghost"
                      className="w-full justify-start"
                    >
                      {device.nameOfficial}
                    </Button>
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
                    <Button
                      key={range.value}
                      type="button"
                      variant="ghost"
                      className="w-full justify-start"
                    >
                      {range.label}
                    </Button>
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
              <ClinicSortSelect />
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
