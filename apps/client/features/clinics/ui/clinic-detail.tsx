import { ExternalLink } from "lucide-react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Clinic, Device, PlanWithPrice } from "@/lib/mock";
import { PREFECTURE } from "@/lib/mock";
import { DevicePriceTable } from "./device-price-table";

type PlansByDevice = {
  device: Device;
  plans: PlanWithPrice[];
};

type ClinicDetailProps = {
  clinic: Clinic;
  plansByDevice: PlansByDevice[];
};

export function ClinicDetail({ clinic, plansByDevice }: ClinicDetailProps) {
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
                <Link href="/clinics">クリニック一覧</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{clinic.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

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
