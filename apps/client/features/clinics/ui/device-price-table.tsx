import Link from "next/link";
import { PriceDisplay, PriceTypeBadge, SourceLink } from "@/components/common";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Device, PlanWithPrice } from "@/lib/mock";
import { BODY_PART, UNIT_TYPE } from "@/lib/mock";

type DevicePriceTableProps = {
  device: Device;
  plans: PlanWithPrice[];
};

export function DevicePriceTable({ device, plans }: DevicePriceTableProps) {
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
                <PlanTableRow key={plan.id} plan={plan} />
              ))}
            </tbody>
          </table>
        </div>
        <PlanTableDisclaimer plans={plans} />
      </CardContent>
    </Card>
  );
}

function PlanTableRow({ plan }: { plan: PlanWithPrice }) {
  return (
    <tr className="hover:bg-muted/30">
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
        <PriceTypeBadge priceType={plan.priceEntry.priceType} />
      </td>
      <td className="px-4 py-3 text-right">
        <PriceDisplay
          price={plan.priceEntry.priceYen}
          className="font-semibold text-foreground price-display"
        />
      </td>
      <td className="px-4 py-3 text-right">
        <SourceLink priceEntry={plan.priceEntry} />
      </td>
    </tr>
  );
}

function PlanTableDisclaimer({ plans }: { plans: PlanWithPrice[] }) {
  const plansWithDisclaimer = plans.filter((p) => p.priceEntry.disclaimer);
  if (plansWithDisclaimer.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-border px-4 py-3">
      {plansWithDisclaimer.map((p) => (
        <p key={p.id} className="text-xs text-muted-foreground/70">
          ※ {p.priceEntry.disclaimer}
        </p>
      ))}
    </div>
  );
}
