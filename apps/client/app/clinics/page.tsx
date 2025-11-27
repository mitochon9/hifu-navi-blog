import type { Metadata } from "next";
import { ClinicList } from "@/features/clinics";
import {
  getPlansForClinic,
  getPriceEntriesForPlan,
  getPublishedClinics,
  getPublishedDevices,
} from "@/lib/mock";

export const metadata: Metadata = {
  title: "クリニック一覧",
  description: "HIFU施術を受けられるクリニック一覧。エリア・機種・価格帯で絞り込み、比較できます。",
};

function getClinicStats(clinicId: string) {
  const plans = getPlansForClinic(clinicId);
  const deviceIds = new Set(plans.map((p) => p.deviceId));
  const allPrices = plans.flatMap((plan) =>
    getPriceEntriesForPlan(plan.id).map((pe) => pe.priceYen)
  );

  return {
    deviceCount: deviceIds.size,
    planCount: plans.length,
    priceMin: allPrices.length > 0 ? Math.min(...allPrices) : null,
  };
}

export default function ClinicsPage() {
  const clinics = getPublishedClinics().sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
  const devices = getPublishedDevices();

  return <ClinicList clinics={clinics} devices={devices} getClinicStats={getClinicStats} />;
}
