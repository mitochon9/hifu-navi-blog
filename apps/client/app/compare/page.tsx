import type { Metadata } from "next";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CompareFilters, type CompareResult, columns, DataTable } from "@/features/compare";
import { getPublishedClinics, getPublishedDevices, mockPlans, mockPriceEntries } from "@/lib/mock";

export const metadata: Metadata = {
  title: "条件比較",
  description:
    "HIFU施術を同条件で価格比較。機種・部位・ショット数・価格種別を指定して、複数クリニックを一覧比較できます。",
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
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">ホーム</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>条件比較</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            条件比較
          </h1>
          <p className="mt-2 text-muted-foreground">
            機種・部位・ショット数・価格種別を指定して、複数クリニックを一覧比較
          </p>
        </div>

        {/* Filter Panel */}
        <CompareFilters devices={devices} resultsCount={results.length} />

        {/* Results Table */}
        <DataTable columns={columns} data={results} />

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
