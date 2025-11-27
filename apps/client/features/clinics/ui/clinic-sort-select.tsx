"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ClinicSortSelect() {
  return (
    <Select defaultValue="updated">
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="updated">更新日順</SelectItem>
        <SelectItem value="price-low">価格が安い順</SelectItem>
        <SelectItem value="name">名前順</SelectItem>
      </SelectContent>
    </Select>
  );
}
