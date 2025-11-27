"use client";

import { FilterSelect } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Device } from "@/lib/mock";
import { BODY_PART, PREFECTURE, PRICE_TYPE } from "@/lib/mock";

type CompareFiltersProps = {
  devices: Device[];
  resultsCount: number;
};

export function CompareFilters({ devices, resultsCount }: CompareFiltersProps) {
  return (
    <Card className="mb-8">
      <CardContent className="p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect
            id="device-filter"
            label="機種"
            placeholder="すべての機種"
            options={devices.map((device) => ({
              value: device.slug,
              label: device.nameOfficial,
            }))}
            allOptionLabel="すべての機種"
          />

          <FilterSelect
            id="body-part-filter"
            label="部位"
            placeholder="すべての部位"
            options={Object.entries(BODY_PART).map(([key, label]) => ({
              value: key,
              label,
            }))}
            allOptionLabel="すべての部位"
          />

          <FilterSelect
            id="price-type-filter"
            label="価格種別"
            placeholder="すべての価格種別"
            options={Object.entries(PRICE_TYPE).map(([key, label]) => ({
              value: key,
              label,
            }))}
            allOptionLabel="すべての価格種別"
          />

          <FilterSelect
            id="area-filter"
            label="エリア"
            placeholder="すべてのエリア"
            options={Object.entries(PREFECTURE).map(([key, label]) => ({
              value: key,
              label,
            }))}
            allOptionLabel="すべてのエリア"
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{resultsCount}件の結果</p>
          <Button type="button">検索する</Button>
        </div>
      </CardContent>
    </Card>
  );
}
