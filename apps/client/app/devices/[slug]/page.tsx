import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DateDisplay, PriceDisplay, SourceLink } from "@/components/common";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Clinic, Plan, PriceEntry } from "@/lib/mock";
import {
  BODY_PART,
  getDeviceBySlug,
  getPlansForDevice,
  getPriceEntriesForPlan,
  getPublishedClinics,
  getPublishedDevices,
  PRICE_TYPE,
  UNIT_TYPE,
} from "@/lib/mock";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const device = getDeviceBySlug(slug);

  if (!device) {
    return {
      title: "機種が見つかりません",
    };
  }

  return {
    title: `${device.nameOfficial} - HIFU機種詳細`,
    description: device.descriptionShort,
  };
}

export async function generateStaticParams() {
  const devices = getPublishedDevices();
  return devices.map((device) => ({
    slug: device.slug,
  }));
}

type PlanWithDetails = Plan & {
  priceEntries: PriceEntry[];
  clinic: Clinic;
};

function getDevicePlansWithDetails(deviceId: string): PlanWithDetails[] {
  const plans = getPlansForDevice(deviceId);
  const clinics = getPublishedClinics();
  const clinicMap = new Map(clinics.map((c) => [c.id, c]));

  return plans
    .map((plan) => {
      const clinic = clinicMap.get(plan.clinicId);
      if (!clinic) {
        return null;
      }

      const priceEntries = getPriceEntriesForPlan(plan.id);
      return {
        ...plan,
        priceEntries,
        clinic,
      };
    })
    .filter((p): p is PlanWithDetails => p !== null);
}

function getPriceRangeByBodyPart(plans: PlanWithDetails[]) {
  const bodyPartPrices: Record<string, number[]> = {};

  for (const plan of plans) {
    const existing = bodyPartPrices[plan.bodyPart];
    if (!existing) {
      bodyPartPrices[plan.bodyPart] = [];
    }
    for (const pe of plan.priceEntries) {
      const prices = bodyPartPrices[plan.bodyPart];
      if (prices) {
        prices.push(pe.priceYen);
      }
    }
  }

  return Object.entries(bodyPartPrices).map(([bodyPart, prices]) => ({
    bodyPart,
    min: Math.min(...prices),
    max: Math.max(...prices),
    count: prices.length,
  }));
}

export default async function DeviceDetailPage({ params }: Props) {
  const { slug } = await params;
  const device = getDeviceBySlug(slug);

  if (!device) {
    notFound();
  }

  const plans = getDevicePlansWithDetails(device.id);
  const priceRanges = getPriceRangeByBodyPart(plans);
  const clinicCount = new Set(plans.map((p) => p.clinicId)).size;

  return (
    <div className="py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">ホーム</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/devices">機種一覧</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{device.nameOfficial}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Device Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {device.nameOfficial}
          </h1>
          {device.aliases.length > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">別名: {device.aliases.join(", ")}</p>
          )}
          {device.manufacturer && (
            <p className="mt-1 text-sm text-muted-foreground">メーカー: {device.manufacturer}</p>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            <section className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-foreground">機種概要</h2>
              <p className="leading-relaxed text-muted-foreground">{device.descriptionShort}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {device.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            {/* Price Range by Body Part */}
            {priceRanges.length > 0 && (
              <section className="mb-8">
                <h2 className="mb-3 text-lg font-semibold text-foreground">部位別相場</h2>
                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-foreground">部位</th>
                        <th className="px-4 py-3 text-right font-medium text-foreground">
                          相場レンジ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {priceRanges.map((range) => (
                        <tr key={range.bodyPart}>
                          <td className="px-4 py-3 text-foreground">
                            {BODY_PART[range.bodyPart as keyof typeof BODY_PART]}
                          </td>
                          <td className="px-4 py-3 text-right font-medium price-display">
                            <PriceDisplay price={range.min} />
                            {range.min !== range.max && (
                              <span>
                                {" "}
                                〜 <PriceDisplay price={range.max} />
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Clinics List */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  取扱いクリニック ({clinicCount}院)
                </h2>
                <Link
                  href={`/compare?device=${device.slug}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  条件比較する →
                </Link>
              </div>
              <div className="space-y-4">
                {plans.map((plan) => (
                  <ClinicPlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">この機種の情報</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">取扱いクリニック</span>
                    <span className="font-medium">{clinicCount}院</span>
                  </div>
                  {priceRanges.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">価格帯</span>
                      <span className="font-medium price-display">
                        <PriceDisplay price={Math.min(...priceRanges.map((r) => r.min))} />〜
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">メーカー</span>
                    <span className="font-medium">{device.manufacturer || "不明"}</span>
                  </div>
                </CardContent>
              </Card>

              <Link
                href={`/compare?device=${device.slug}`}
                className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                条件を指定して比較する
              </Link>
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

function ClinicPlanCard({ plan }: { plan: PlanWithDetails }) {
  const lowestPrice = Math.min(...plan.priceEntries.map((pe) => pe.priceYen));
  const latestEntry = plan.priceEntries.sort(
    (a, b) => b.confirmedDate.getTime() - a.confirmedDate.getTime()
  )[0];

  return (
    <Card className="transition-shadow hover:shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <Link
              href={`/clinics/${plan.clinic.slug}`}
              className="font-semibold text-foreground hover:text-primary hover:underline"
            >
              {plan.clinic.name}
            </Link>
            <p className="mt-0.5 text-xs text-muted-foreground">{plan.clinic.nearestStation}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {BODY_PART[plan.bodyPart]} / {plan.shotsOrSessions}
              {UNIT_TYPE[plan.unitType]}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="text-right">
              <PriceDisplay
                price={lowestPrice}
                className="text-lg font-bold text-foreground price-display"
              />
              <span className="ml-1 text-xs text-muted-foreground">〜</span>
            </div>
            <div className="flex flex-wrap justify-end gap-1">
              {plan.priceEntries.map((pe) => (
                <span
                  key={pe.id}
                  className="inline-block rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                >
                  {PRICE_TYPE[pe.priceType]}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Source Info */}
        {latestEntry && (
          <div className="mt-3 flex items-center gap-2 border-t border-border/40 pt-3 text-xs text-muted-foreground/70">
            <span>
              確認日: <DateDisplay date={latestEntry.confirmedDate} />
            </span>
            <span>|</span>
            <SourceLink priceEntry={latestEntry} showDate={false} variant="link" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
