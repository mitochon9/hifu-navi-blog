import type { PriceEntry } from "@/lib/mock";
import { PRICE_TYPE } from "@/lib/mock";
import { cn } from "@/shared/lib/utils";

type PriceTypeBadgeProps = {
  priceType: PriceEntry["priceType"];
  className?: string;
};

export function PriceTypeBadge({ priceType, className }: PriceTypeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded px-2 py-0.5 text-xs",
        priceType === "first"
          ? "bg-primary/10 text-primary"
          : priceType === "monitor"
            ? "bg-amber-100 text-amber-700"
            : priceType === "campaign"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-muted text-muted-foreground",
        className
      )}
    >
      {PRICE_TYPE[priceType]}
    </span>
  );
}
