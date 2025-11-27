import {
  Building2,
  Calendar,
  ChevronRight,
  GitCompare,
  Grid3x3,
  Link as LinkIcon,
  List,
  Search,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getPublishedClinics, getPublishedDevices } from "@/lib/mock";

export const metadata: Metadata = {
  title: "HIFU比較ナビ | 機種×クリニック×価格を透明に比較",
  description:
    "HIFU施術の機種ごとの取扱いクリニックと正規化された価格情報を集約。同条件で比較・意思決定できる透明な情報体験を提供します。",
};

export default function Home() {
  const popularDevices = getPublishedDevices().slice(0, 4);
  const recentClinics = getPublishedClinics()
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/40 bg-linear-to-b from-muted/50 to-background py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              HIFU機種×クリニック×価格を
              <br className="hidden sm:inline" />
              <span className="text-primary">透明に比較</span>
            </h1>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
              同じ条件で価格を比較。すべての価格に確認日と根拠URLを表示。
              <br className="hidden sm:inline" />
              信頼できる情報で、あなたの意思決定をサポートします。
            </p>
          </div>

          {/* Search Bar */}
          <div className="mx-auto mt-10 max-w-2xl">
            <SearchBar />
          </div>

          {/* Quick Access Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <QuickAccessButton href="/devices" icon={<Grid3x3 className="h-4 w-4" />}>
              機種から探す
            </QuickAccessButton>
            <QuickAccessButton href="/clinics" icon={<Building2 className="h-4 w-4" />}>
              クリニックから探す
            </QuickAccessButton>
            <QuickAccessButton href="/compare" icon={<GitCompare className="h-4 w-4" />} primary>
              条件比較する
            </QuickAccessButton>
          </div>
        </div>

        {/* Decorative background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-linear-to-br from-primary/5 to-transparent blur-3xl" />
        </div>
      </section>

      {/* Popular Devices */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeader
            title="人気のHIFU機種"
            description="取扱いクリニック数・閲覧数の多い機種をピックアップ"
            href="/devices"
            linkText="すべての機種を見る"
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popularDevices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        </div>
      </section>

      {/* Recently Updated Clinics */}
      <section className="border-t border-border/40 bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeader
            title="最近更新されたクリニック"
            description="価格情報が新しく更新されたクリニック"
            href="/clinics"
            linkText="すべてのクリニックを見る"
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {recentClinics.map((clinic) => (
              <ClinicCard key={clinic.id} clinic={clinic} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              透明性へのこだわり
            </h2>
            <p className="mt-4 text-muted-foreground">
              すべての価格情報に根拠と確認日を明記。比較サイトとしての信頼性を担保します。
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <TrustCard
              icon={<LinkIcon className="h-6 w-6" />}
              title="根拠URLを明記"
              description="価格は公式サイトから取得。クリックで確認可能。"
            />
            <TrustCard
              icon={<Calendar className="h-6 w-6" />}
              title="確認日を表示"
              description="いつ時点の情報かを常に明示。古い情報は警告表示。"
            />
            <TrustCard
              icon={<List className="h-6 w-6" />}
              title="条件を正規化"
              description="機種・部位・ショット数で統一。同条件比較が可能。"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================
// Sub Components
// ============================================

function SearchBar() {
  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="エリア・駅名・機種名で検索..."
        className="h-14 rounded-xl px-5 pr-12 text-base shadow-sm"
      />
      <Button
        type="button"
        size="icon"
        className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-lg"
        aria-label="検索"
      >
        <Search className="h-5 w-5" />
      </Button>
    </div>
  );
}

function QuickAccessButton({
  href,
  icon,
  children,
  primary = false,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <Button asChild variant={primary ? "default" : "outline"}>
      <Link href={href}>
        {icon}
        {children}
      </Link>
    </Button>
  );
}

function SectionHeader({
  title,
  description,
  href,
  linkText,
}: {
  title: string;
  description: string;
  href: string;
  linkText: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Button asChild variant="link" className="group">
        <Link href={href}>
          {linkText}
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </Button>
    </div>
  );
}

function DeviceCard({ device }: { device: ReturnType<typeof getPublishedDevices>[number] }) {
  return (
    <Link href={`/devices/${device.slug}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{device.nameOfficial}</CardTitle>
          {device.manufacturer && (
            <p className="text-xs text-muted-foreground">{device.manufacturer}</p>
          )}
        </CardHeader>
        <CardContent>
          <p className="line-clamp-2 text-sm text-muted-foreground">{device.descriptionShort}</p>
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
        </CardContent>
      </Card>
    </Link>
  );
}

function ClinicCard({ clinic }: { clinic: ReturnType<typeof getPublishedClinics>[number] }) {
  return (
    <Link href={`/clinics/${clinic.slug}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{clinic.name}</CardTitle>
          <p className="text-xs text-muted-foreground">{clinic.nearestStation}</p>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-2 text-sm text-muted-foreground">{clinic.descriptionShort}</p>
          <p className="mt-3 text-xs text-muted-foreground/70">
            更新: {clinic.updatedAt.toLocaleDateString("ja-JP")}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function TrustCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-border/60 bg-card p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
