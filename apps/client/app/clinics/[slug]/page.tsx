import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Device, PlanWithPrice } from "@/lib/mock";
import {
  BODY_PART,
  getClinicBySlug,
  getPlansWithPrices,
  getPublishedClinics,
  getPublishedDevices,
  PREFECTURE,
  PRICE_TYPE,
  UNIT_TYPE,
} from "@/lib/mock";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const clinic = getClinicBySlug(slug);

  if (!clinic) {
    return {
      title: "クリニックが見つかりません",
    };
  }

  return {
    title: `${clinic.name} - HIFU取扱いクリニック`,
    description:
      clinic.descriptionShort ||
      `${clinic.name}のHIFU施術メニューと価格一覧。${clinic.nearestStation}`,
  };
}

export async function generateStaticParams() {
  const clinics = getPublishedClinics();
  return clinics.map((clinic) => ({
    slug: clinic.slug,
  }));
}

type PlansByDevice = {
  device: Device;
  plans: PlanWithPrice[];
};

function groupPlansByDevice(plans: PlanWithPrice[]): PlansByDevice[] {
  const devices = getPublishedDevices();
  const deviceMap = new Map(devices.map((d) => [d.id, d]));

  const grouped: Record<string, PlanWithPrice[]> = {};

  for (const plan of plans) {
    const existing = grouped[plan.deviceId];
    if (existing) {
      existing.push(plan);
    } else {
      grouped[plan.deviceId] = [plan];
    }
  }

  return Object.entries(grouped)
    .map(([deviceId, devicePlans]) => {
      const device = deviceMap.get(deviceId);
      if (!device) {
        return null;
      }
      return { device, plans: devicePlans };
    })
    .filter((g): g is PlansByDevice => {
      return g !== null;
    });
}

export default async function ClinicDetailPage({ params }: Props) {
  const { slug } = await params;
  const clinic = getClinicBySlug(slug);

  if (!clinic) {
    notFound();
  }

  const plans = getPlansWithPrices(clinic.id);
  const plansByDevice = groupPlansByDevice(plans);

  return (
    <div className="py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            ホーム
          </Link>
          <span className="mx-2">/</span>
          <Link href="/clinics" className="hover:text-foreground">
            クリニック一覧
          </Link>
          <span className="mx-2">/</span>
          <span>{clinic.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Clinic Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {clinic.name}
              </h1>
              <p className="mt-2 text-muted-foreground">{clinic.nearestStation}</p>
              {clinic.descriptionShort && (
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {clinic.descriptionShort}
                </p>
              )}
            </div>

            {/* Price Table by Device */}
            {plansByDevice.length > 0 ? (
              <section className="space-y-8">
                <h2 className="text-lg font-semibold text-foreground">価格表</h2>
                {plansByDevice.map(({ device, plans }) => (
                  <DevicePriceTable key={device.id} device={device} plans={plans} />
                ))}
              </section>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  価格情報が登録されていません
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Clinic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">クリニック情報</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">住所</span>
                    <p className="mt-1 text-foreground">{clinic.address}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">最寄り駅</span>
                    <p className="mt-1 text-foreground">{clinic.nearestStation}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">エリア</span>
                    <p className="mt-1 text-foreground">
                      {PREFECTURE[clinic.prefecture]} {clinic.city}
                    </p>
                  </div>
                  <div className="border-t border-border pt-4">
                    <a
                      href={clinic.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      公式サイトを見る
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Handled Devices */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">対応機種</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {plansByDevice.map(({ device }) => (
                      <Link
                        key={device.id}
                        href={`/devices/${device.slug}`}
                        className="inline-block rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                      >
                        {device.nameOfficial}
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Compare Button */}
              <Link
                href={`/compare?clinic=${clinic.slug}`}
                className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                他のクリニックと比較する
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

function DevicePriceTable({ device, plans }: { device: Device; plans: PlanWithPrice[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Link
            href={`/devices/${device.slug}`}
            className="font-semibold text-foreground hover:text-primary hover:underline"
          >
            {device.nameOfficial}
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-y border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-foreground">部位 / プラン</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">価格種別</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">価格</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">確認日</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div>
                      <span className="text-foreground">{BODY_PART[plan.bodyPart]}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {plan.shotsOrSessions}
                        {UNIT_TYPE[plan.unitType]}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{plan.planLabel}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs ${
                        plan.priceEntry.priceType === "first"
                          ? "bg-primary/10 text-primary"
                          : plan.priceEntry.priceType === "monitor"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {PRICE_TYPE[plan.priceEntry.priceType]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-foreground price-display">
                      ¥{plan.priceEntry.priceYen.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs text-muted-foreground">
                        {plan.priceEntry.confirmedDate.toLocaleDateString("ja-JP")}
                      </span>
                      <a
                        href={plan.priceEntry.sourceUrl}
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
              ))}
            </tbody>
          </table>
        </div>
        {plans.some((p) => p.priceEntry.disclaimer) && (
          <div className="border-t border-border px-4 py-3">
            {plans
              .filter((p) => p.priceEntry.disclaimer)
              .map((p) => (
                <p key={p.id} className="text-xs text-muted-foreground/70">
                  ※ {p.priceEntry.disclaimer}
                </p>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
