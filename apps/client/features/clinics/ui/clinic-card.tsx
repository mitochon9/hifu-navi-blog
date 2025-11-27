import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { Clinic } from "@/lib/mock";

type ClinicStats = {
  deviceCount: number;
  planCount: number;
  priceMin: number | null;
};

type ClinicCardProps = {
  clinic: Clinic;
  stats: ClinicStats;
};

export function ClinicCard({ clinic, stats }: ClinicCardProps) {
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
