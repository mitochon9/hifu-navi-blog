import type { Clinic, Device, Plan, PriceEntry } from "@/lib/mock";

export type CompareResult = {
  plan: Plan;
  priceEntry: PriceEntry;
  clinic: Clinic;
  device: Device;
};
