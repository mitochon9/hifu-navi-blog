import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClinicDetail } from "@/features/clinics";
import type { Device, PlanWithPrice } from "@/lib/mock";
import {
  getClinicBySlug,
  getPlansWithPrices,
  getPublishedClinics,
  getPublishedDevices,
} from "@/lib/mock";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const clinic = getClinicBySlug(slug);

  if (!clinic) {
    return {
      title: "クリニックが見つかりません",
    };
  }

  return {
    title: `${clinic.name} - HIFU取扱いクリニック`,
    description:
      clinic.descriptionShort ||
      `${clinic.name}のHIFU施術メニューと価格一覧。${clinic.nearestStation}`,
  };
}

export async function generateStaticParams() {
  const clinics = getPublishedClinics();
  return clinics.map((clinic) => ({
    slug: clinic.slug,
  }));
}

type PlansByDevice = {
  device: Device;
  plans: PlanWithPrice[];
};

function groupPlansByDevice(plans: PlanWithPrice[]): PlansByDevice[] {
  const devices = getPublishedDevices();
  const deviceMap = new Map(devices.map((d) => [d.id, d]));

  const grouped: Record<string, PlanWithPrice[]> = {};

  for (const plan of plans) {
    const existing = grouped[plan.deviceId];
    if (existing) {
      existing.push(plan);
    } else {
      grouped[plan.deviceId] = [plan];
    }
  }

  return Object.entries(grouped)
    .map(([deviceId, devicePlans]) => {
      const device = deviceMap.get(deviceId);
      if (!device) {
        return null;
      }
      return { device, plans: devicePlans };
    })
    .filter((g): g is PlansByDevice => {
      return g !== null;
    });
}

export default async function ClinicDetailPage({ params }: Props) {
  const { slug } = await params;
  const clinic = getClinicBySlug(slug);

  if (!clinic) {
    notFound();
  }

  const plans = getPlansWithPrices(clinic.id);
  const plansByDevice = groupPlansByDevice(plans);

  return <ClinicDetail clinic={clinic} plansByDevice={plansByDevice} />;
}
