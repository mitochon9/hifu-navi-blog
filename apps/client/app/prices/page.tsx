import type { Metadata } from "next";
import Link from "next/link";
import { PriceDisplay } from "@/components/common";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  BODY_PART,
  getPlansForDevice,
  getPriceEntriesForPlan,
  getPublishedDevices,
  mockPriceEntries,
} from "@/lib/mock";

export const metadata: Metadata = {
  title: "HIFU相場ガイド",
  description: "HIFU施術の相場価格を機種別・部位別に解説。価格の読み方と適正価格の見極め方。",
};

type PriceStats = {
  deviceId: string;
  deviceName: string;
  deviceSlug: string;
  bodyPart: string;
  prices: number[];
  min: number;
  max: number;
  avg: number;
  median: number;
};

function calculatePriceStats(): PriceStats[] {
  const devices = getPublishedDevices();
  const stats: PriceStats[] = [];

  for (const device of devices) {
    const plans = getPlansForDevice(device.id);
    const byBodyPart: Record<string, number[]> = {};

    for (const plan of plans) {
      const priceEntries = getPriceEntriesForPlan(plan.id);
      for (const pe of priceEntries) {
        const existing = byBodyPart[plan.bodyPart];
        if (existing) {
          existing.push(pe.priceYen);
        } else {
          byBodyPart[plan.bodyPart] = [pe.priceYen];
        }
      }
    }

    for (const [bodyPart, prices] of Object.entries(byBodyPart)) {
      if (prices.length === 0) {
        continue;
      }

      const sorted = [...prices].sort((a, b) => a - b);
      const sum = prices.reduce((a, b) => a + b, 0);

      let median: number;
      if (sorted.length % 2 === 0) {
        const midLow = sorted[sorted.length / 2 - 1] ?? 0;
        const midHigh = sorted[sorted.length / 2] ?? 0;
        median = (midLow + midHigh) / 2;
      } else {
        median = sorted[Math.floor(sorted.length / 2)] ?? 0;
      }

      stats.push({
        deviceId: device.id,
        deviceName: device.nameOfficial,
        deviceSlug: device.slug,
        bodyPart,
        prices,
        min: Math.min(...prices),
        max: Math.max(...prices),
        avg: Math.round(sum / prices.length),
        median: Math.round(median),
      });
    }
  }

  return stats.sort((a, b) => a.deviceName.localeCompare(b.deviceName));
}

function getOverallStats() {
  const allPrices = mockPriceEntries
    .filter((pe) => pe.isActive && pe.status === "published")
    .map((pe) => pe.priceYen);

  if (allPrices.length === 0) {
    return { min: 0, max: 0, avg: 0, count: 0 };
  }

  const sum = allPrices.reduce((a, b) => a + b, 0);
  return {
    min: Math.min(...allPrices),
    max: Math.max(...allPrices),
    avg: Math.round(sum / allPrices.length),
    count: allPrices.length,
  };
}

export default function PricesPage() {
  const stats = calculatePriceStats();
  const overall = getOverallStats();
  const devices = getPublishedDevices();

  // Group stats by device
  const statsByDevice = devices.map((device) => ({
    device,
    stats: stats.filter((s) => s.deviceId === device.id),
  }));

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
            <span>相場ガイド</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            HIFU相場ガイド
          </h1>
          <p className="mt-2 text-muted-foreground">
            機種別・部位別の価格レンジと相場の読み方を解説
          </p>
        </div>

        {/* Overall Summary */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <SummaryCard
            label="最安値"
            value={`¥${overall.min.toLocaleString()}`}
            description="当サイト掲載の最安プラン"
          />
          <SummaryCard
            label="平均価格"
            value={`¥${overall.avg.toLocaleString()}`}
            description="全プランの平均"
          />
          <SummaryCard
            label="最高値"
            value={`¥${overall.max.toLocaleString()}`}
            description="当サイト掲載の最高プラン"
          />
          <SummaryCard
            label="掲載プラン数"
            value={`${overall.count}件`}
            description="価格情報の総数"
          />
        </div>

        {/* Price Guide */}
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold text-foreground">相場の読み方</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  HIFU施術の価格は、<strong className="text-foreground">機種</strong>・
                  <strong className="text-foreground">部位</strong>・
                  <strong className="text-foreground">ショット数/回数</strong>・
                  <strong className="text-foreground">価格種別（初回/通常/モニター）</strong>
                  によって大きく異なります。
                </p>
                <p>
                  「安い」「高い」を判断する際は、これらの条件を揃えて比較することが重要です。
                  当サイトでは、各価格に必ず根拠URLと確認日を表示していますので、
                  最新情報は公式サイトでもご確認ください。
                </p>
                <div className="mt-4 rounded-lg bg-muted/50 p-4">
                  <h3 className="mb-2 font-medium text-foreground">価格種別について</h3>
                  <ul className="space-y-1.5">
                    <li>
                      <span className="font-medium text-primary">初回限定</span>：
                      初めての方のみ適用される割引価格
                    </li>
                    <li>
                      <span className="font-medium text-foreground">通常価格</span>：
                      2回目以降も適用される標準価格
                    </li>
                    <li>
                      <span className="font-medium text-amber-600">モニター価格</span>：
                      症例写真提供等の条件付き割引価格
                    </li>
                    <li>
                      <span className="font-medium text-emerald-600">キャンペーン</span>：
                      期間限定の特別価格
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Price by Device */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">機種別相場一覧</h2>
            <Link href="/compare" className="text-sm font-medium text-primary hover:underline">
              条件を指定して比較する →
            </Link>
          </div>

          <div className="space-y-6">
            {statsByDevice.map(({ device, stats }) => (
              <DevicePriceCard key={device.id} device={device} stats={stats} />
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-foreground">よくある質問</h2>
          <div className="space-y-4">
            <FaqItem
              question="なぜクリニックによって価格が違うのですか？"
              answer="機種の違い、ショット数の違い、施術者の経験、クリニックの立地やブランド、キャンペーンの有無などが価格差の要因となります。同じ機種・部位・ショット数で比較することで、より正確な比較ができます。"
            />
            <FaqItem
              question="初回限定価格は何回まで使えますか？"
              answer="基本的に1人1回（初回のみ）です。ただし、クリニックによっては同一グループ内で複数院の「初回」を利用できないケースもあります。詳細は各クリニックにご確認ください。"
            />
            <FaqItem
              question="安いクリニックは品質が低いですか？"
              answer="価格だけで品質は判断できません。キャンペーンで安くなっているケース、大手で薄利多売のケース、逆に高額でも広告費が上乗せされているケースなど様々です。口コミや症例写真なども参考にしましょう。"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

// ============================================
// Sub Components
// ============================================

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold text-foreground price-display">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground/70">{description}</p>
      </CardContent>
    </Card>
  );
}

function DevicePriceCard({
  device,
  stats,
}: {
  device: ReturnType<typeof getPublishedDevices>[number];
  stats: PriceStats[];
}) {
  if (stats.length === 0) {
    return null;
  }

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
          <span className="text-xs text-muted-foreground">{device.manufacturer}</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-y border-border bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-foreground">部位</th>
                <th className="px-4 py-2 text-right font-medium text-foreground">最安値</th>
                <th className="px-4 py-2 text-right font-medium text-foreground">平均</th>
                <th className="px-4 py-2 text-right font-medium text-foreground">最高値</th>
                <th className="px-4 py-2 text-right font-medium text-foreground">データ数</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.map((stat) => (
                <tr key={`${stat.deviceId}-${stat.bodyPart}`}>
                  <td className="px-4 py-2 text-foreground">
                    {BODY_PART[stat.bodyPart as keyof typeof BODY_PART]}
                  </td>
                  <td className="px-4 py-2 text-right font-medium text-primary price-display">
                    <PriceDisplay price={stat.min} />
                  </td>
                  <td className="px-4 py-2 text-right text-muted-foreground price-display">
                    <PriceDisplay price={stat.avg} />
                  </td>
                  <td className="px-4 py-2 text-right text-muted-foreground price-display">
                    <PriceDisplay price={stat.max} />
                  </td>
                  <td className="px-4 py-2 text-right text-xs text-muted-foreground">
                    {stat.prices.length}件
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="font-medium text-foreground">{question}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{answer}</p>
      </CardContent>
    </Card>
  );
}
