"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { PriceDisplay, PriceTypeBadge, SourceLink } from "@/components/common";
import { Button } from "@/components/ui/button";
import { BODY_PART, UNIT_TYPE } from "@/lib/mock";
import type { CompareResult } from "../model/types";

export const columns: ColumnDef<CompareResult>[] = [
  {
    accessorKey: "clinic",
    header: "クリニック",
    cell: ({ row }) => {
      const clinic = row.original.clinic;
      return (
        <div>
          <Link
            href={`/clinics/${clinic.slug}`}
            className="font-medium text-foreground hover:text-primary hover:underline"
          >
            {clinic.name}
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">{clinic.nearestStation}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "device",
    header: "機種",
    cell: ({ row }) => {
      const device = row.original.device;
      return (
        <Link
          href={`/devices/${device.slug}`}
          className="text-foreground hover:text-primary hover:underline"
        >
          {device.nameOfficial}
        </Link>
      );
    },
  },
  {
    accessorKey: "bodyPart",
    header: "部位 / 内容",
    cell: ({ row }) => {
      const plan = row.original.plan;
      return (
        <div>
          <div className="text-foreground">{BODY_PART[plan.bodyPart]}</div>
          <div className="text-xs text-muted-foreground">
            {plan.shotsOrSessions}
            {UNIT_TYPE[plan.unitType]}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "priceType",
    header: "価格種別",
    cell: ({ row }) => {
      return <PriceTypeBadge priceType={row.original.priceEntry.priceType} />;
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            価格
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-right">
          <PriceDisplay
            price={row.original.priceEntry.priceYen}
            className="font-semibold text-foreground price-display"
          />
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      return rowA.original.priceEntry.priceYen - rowB.original.priceEntry.priceYen;
    },
  },
  {
    accessorKey: "confirmedDate",
    header: () => <div className="text-right">確認日</div>,
    cell: ({ row }) => {
      return <SourceLink priceEntry={row.original.priceEntry} />;
    },
  },
];
