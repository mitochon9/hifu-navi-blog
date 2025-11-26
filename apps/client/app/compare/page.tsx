import { ArrowUpDown, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { Clinic, Device, Plan, PriceEntry } from "@/lib/mock";
import {
  BODY_PART,
  getPublishedClinics,
  getPublishedDevices,
  mockPlans,
  mockPriceEntries,
  PREFECTURE,
  PRICE_TYPE,
  UNIT_TYPE,
} from "@/lib/mock";

export const metadata: Metadata = {
  title: "条件比較",
  description:
    "HIFU施術を同条件で価格比較。機種・部位・ショット数・価格種別を指定して、複数クリニックを一覧比較できます。",
};

type CompareResult = {
  plan: Plan;
  priceEntry: PriceEntry;
  clinic: Clinic;
  device: Device;
};

function getCompareResults(): CompareResult[] {
  const clinics = getPublishedClinics();
  const devices = getPublishedDevices();
  const clinicMap = new Map(clinics.map((c) => [c.id, c]));
  const deviceMap = new Map(devices.map((d) => [d.id, d]));

  const results: CompareResult[] = [];

  for (const plan of mockPlans) {
    if (plan.status !== "published") {
      continue;
    }

    const clinic = clinicMap.get(plan.clinicId);
    const device = deviceMap.get(plan.deviceId);
    if (!clinic || !device) {
      continue;
    }

    const priceEntries = mockPriceEntries.filter(
      (pe) => pe.planId === plan.id && pe.isActive && pe.status === "published"
    );

    for (const priceEntry of priceEntries) {
      results.push({ plan, priceEntry, clinic, device });
    }
  }

  // Sort by price ascending
  return results.sort((a, b) => a.priceEntry.priceYen - b.priceEntry.priceYen);
}

export default function ComparePage() {
  const results = getCompareResults();
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
            <span>条件比較</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            条件比較
          </h1>
          <p className="mt-2 text-muted-foreground">
            機種・部位・ショット数・価格種別を指定して、複数クリニックを一覧比較
          </p>
        </div>

        {/* Filter Panel */}
        <Card className="mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Device Filter */}
              <div>
                <label
                  htmlFor="device-filter"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  機種
                </label>
                <select
                  id="device-filter"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="">すべての機種</option>
                  {devices.map((device) => (
                    <option key={device.id} value={device.slug}>
                      {device.nameOfficial}
                    </option>
                  ))}
                </select>
              </div>

              {/* Body Part Filter */}
              <div>
                <label
                  htmlFor="body-part-filter"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  部位
                </label>
                <select
                  id="body-part-filter"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="">すべての部位</option>
                  {Object.entries(BODY_PART).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Type Filter */}
              <div>
                <label
                  htmlFor="price-type-filter"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  価格種別
                </label>
                <select
                  id="price-type-filter"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="">すべての価格種別</option>
                  {Object.entries(PRICE_TYPE).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Area Filter */}
              <div>
                <label
                  htmlFor="area-filter"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  エリア
                </label>
                <select
                  id="area-filter"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="">すべてのエリア</option>
                  {Object.entries(PREFECTURE).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{results.length}件の結果</p>
              <button
                type="button"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                検索する
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-foreground">
                    クリニック
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-foreground">
                    機種
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-foreground">
                    部位 / 内容
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-foreground">
                    価格種別
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right font-medium text-foreground">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-primary"
                    >
                      価格
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right font-medium text-foreground">
                    確認日
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {results.map((result) => (
                  <CompareRow key={`${result.plan.id}-${result.priceEntry.id}`} result={result} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 rounded-xl border border-border/60 bg-muted/30 p-6">
          <h2 className="font-semibold text-foreground">比較のポイント</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>同じ機種・部位・ショット数で比較すると、より正確な比較ができます</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>「初回限定」価格は初めての方のみ適用。継続予定なら「通常価格」も確認を</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>確認日が古い場合は、公式サイトで最新価格をご確認ください</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Sub Components
// ============================================

function CompareRow({ result }: { result: CompareResult }) {
  const { plan, priceEntry, clinic, device } = result;

  return (
    <tr className="hover:bg-muted/30">
      <td className="px-4 py-3">
        <Link
          href={`/clinics/${clinic.slug}`}
          className="font-medium text-foreground hover:text-primary hover:underline"
        >
          {clinic.name}
        </Link>
        <p className="mt-0.5 text-xs text-muted-foreground">{clinic.nearestStation}</p>
      </td>
      <td className="px-4 py-3">
        <Link
          href={`/devices/${device.slug}`}
          className="text-foreground hover:text-primary hover:underline"
        >
          {device.nameOfficial}
        </Link>
      </td>
      <td className="px-4 py-3">
        <div className="text-foreground">{BODY_PART[plan.bodyPart]}</div>
        <div className="text-xs text-muted-foreground">
          {plan.shotsOrSessions}
          {UNIT_TYPE[plan.unitType]}
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-block rounded px-2 py-0.5 text-xs ${
            priceEntry.priceType === "first"
              ? "bg-primary/10 text-primary"
              : priceEntry.priceType === "monitor"
                ? "bg-amber-100 text-amber-700"
                : priceEntry.priceType === "campaign"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-muted text-muted-foreground"
          }`}
        >
          {PRICE_TYPE[priceEntry.priceType]}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="font-semibold text-foreground price-display">
          ¥{priceEntry.priceYen.toLocaleString()}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs text-muted-foreground">
            {priceEntry.confirmedDate.toLocaleDateString("ja-JP")}
          </span>
          <a
            href={priceEntry.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground/60 hover:text-primary"
            title="根拠URLを確認"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </td>
    </tr>
  );
}
