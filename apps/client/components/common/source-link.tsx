import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PriceEntry } from "@/lib/mock";
import { DateDisplay } from "./date-display";

type SourceLinkProps = {
  priceEntry: PriceEntry;
  showDate?: boolean;
  variant?: "button" | "link";
};

export function SourceLink({ priceEntry, showDate = true, variant = "button" }: SourceLinkProps) {
  if (variant === "link") {
    return (
      <a
        href={priceEntry.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-muted-foreground/60 hover:text-primary"
        title="根拠URLを確認"
      >
        根拠URL
        <ExternalLink className="h-3 w-3" />
      </a>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {showDate && (
        <DateDisplay date={priceEntry.confirmedDate} className="text-xs text-muted-foreground" />
      )}
      <Button
        asChild
        variant="ghost"
        size="icon-sm"
        className="h-auto p-0 text-muted-foreground/60 hover:text-primary"
        title="根拠URLを確認"
      >
        <a href={priceEntry.sourceUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-3 w-3" />
        </a>
      </Button>
    </div>
  );
}
