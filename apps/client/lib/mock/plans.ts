import type { Plan, PlanWithPrice, PriceEntry } from "./types";

export const mockPlans: Plan[] = [
  // 品川美容外科 渋谷院 - ウルトラセルQ+
  {
    id: "plan-1",
    clinicId: "clinic-1",
    deviceId: "device-1",
    bodyPart: "face_full",
    shotsOrSessions: 400,
    unitType: "shots",
    planLabel: "顔全体400ショット",
    status: "published",
    updatedAt: new Date("2024-11-20"),
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "plan-2",
    clinicId: "clinic-1",
    deviceId: "device-1",
    bodyPart: "cheek",
    shotsOrSessions: 200,
    unitType: "shots",
    planLabel: "頬200ショット",
    status: "published",
    updatedAt: new Date("2024-11-20"),
    createdAt: new Date("2024-01-01"),
  },
  // 湘南美容クリニック 新宿本院 - ウルトラセルQ+
  {
    id: "plan-3",
    clinicId: "clinic-2",
    deviceId: "device-1",
    bodyPart: "face_full",
    shotsOrSessions: 400,
    unitType: "shots",
    planLabel: "顔全体400ショット",
    status: "published",
    updatedAt: new Date("2024-11-18"),
    createdAt: new Date("2024-01-01"),
  },
  // 湘南美容クリニック 新宿本院 - ウルセラ
  {
    id: "plan-4",
    clinicId: "clinic-2",
    deviceId: "device-2",
    bodyPart: "face_full",
    shotsOrSessions: 1,
    unitType: "sessions",
    planLabel: "顔全体1回",
    status: "published",
    updatedAt: new Date("2024-11-18"),
    createdAt: new Date("2024-01-01"),
  },
  // TCB 銀座院 - ソノクイーン
  {
    id: "plan-5",
    clinicId: "clinic-3",
    deviceId: "device-4",
    bodyPart: "face_full",
    shotsOrSessions: 600,
    unitType: "shots",
    planLabel: "全顔600ショット",
    status: "published",
    updatedAt: new Date("2024-11-15"),
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "plan-6",
    clinicId: "clinic-3",
    deviceId: "device-4",
    bodyPart: "eye",
    shotsOrSessions: 180,
    unitType: "shots",
    planLabel: "目元180ショット",
    status: "published",
    updatedAt: new Date("2024-11-15"),
    createdAt: new Date("2024-01-01"),
  },
  // 聖心美容クリニック 六本木院 - ウルセラ
  {
    id: "plan-7",
    clinicId: "clinic-4",
    deviceId: "device-2",
    bodyPart: "face_full",
    shotsOrSessions: 1,
    unitType: "sessions",
    planLabel: "フルフェイス1回",
    status: "published",
    updatedAt: new Date("2024-11-10"),
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "plan-8",
    clinicId: "clinic-4",
    deviceId: "device-2",
    bodyPart: "neck",
    shotsOrSessions: 1,
    unitType: "sessions",
    planLabel: "首1回",
    status: "published",
    updatedAt: new Date("2024-11-10"),
    createdAt: new Date("2024-02-01"),
  },
  // 表参道スキンクリニック - ダブロゴールド
  {
    id: "plan-9",
    clinicId: "clinic-5",
    deviceId: "device-3",
    bodyPart: "face_full",
    shotsOrSessions: 300,
    unitType: "shots",
    planLabel: "全顔300ショット",
    status: "published",
    updatedAt: new Date("2024-11-05"),
    createdAt: new Date("2024-03-01"),
  },
  // 共立美容外科 大阪本院 - ウルトラセルQ+
  {
    id: "plan-10",
    clinicId: "clinic-6",
    deviceId: "device-1",
    bodyPart: "face_full",
    shotsOrSessions: 400,
    unitType: "shots",
    planLabel: "顔全体400ショット",
    status: "published",
    updatedAt: new Date("2024-11-01"),
    createdAt: new Date("2024-01-01"),
  },
  // 心斎橋フェミークリニック - ダブロゴールド
  {
    id: "plan-11",
    clinicId: "clinic-7",
    deviceId: "device-3",
    bodyPart: "face_full",
    shotsOrSessions: 400,
    unitType: "shots",
    planLabel: "全顔400ショット",
    status: "published",
    updatedAt: new Date("2024-10-28"),
    createdAt: new Date("2024-02-01"),
  },
  // 横浜TAクリニック - ダブロゴールド
  {
    id: "plan-12",
    clinicId: "clinic-8",
    deviceId: "device-3",
    bodyPart: "face_full",
    shotsOrSessions: 400,
    unitType: "shots",
    planLabel: "全顔400ショット",
    status: "published",
    updatedAt: new Date("2024-10-25"),
    createdAt: new Date("2024-03-01"),
  },
  {
    id: "plan-13",
    clinicId: "clinic-8",
    deviceId: "device-3",
    bodyPart: "jawline",
    shotsOrSessions: 200,
    unitType: "shots",
    planLabel: "フェイスライン200ショット",
    status: "published",
    updatedAt: new Date("2024-10-25"),
    createdAt: new Date("2024-03-01"),
  },
];

export const mockPriceEntries: PriceEntry[] = [
  // plan-1: 品川 ウルトラセルQ+ 顔全体
  {
    id: "price-1",
    planId: "plan-1",
    priceYen: 29800,
    priceType: "first",
    sourceUrl: "https://www.shinagawa.com/hifu/",
    confirmedDate: new Date("2024-11-20"),
    disclaimer: "初回限定、1人1回まで",
    isActive: true,
    status: "published",
    updatedAt: new Date("2024-11-20"),
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "price-1b",
    planId: "plan-1",
    priceYen: 54800,
    priceType: "normal",
    sourceUrl: "https://www.shinagawa.com/hifu/",
    confirmedDate: new Date("2024-11-20"),
    disclaimer: null,
    isActive: true,
    status: "published",
    updatedAt: new Date("2024-11-20"),
    createdAt: new Date("2024-01-01"),
  },
  // plan-2: 品川 ウルトラセルQ+ 頬
  {
    id: "price-2",
    planId: "plan-2",
    priceYen: 19800,
    priceType: "first",
    sourceUrl: "https://www.shinagawa.com/hifu/",
    confirmedDate: new Date("2024-11-20"),
    disclaimer: "初回限定",
    isActive: true,
    status: "published",
    updatedAt: new Date("2024-11-20"),
    createdAt: new Date("2024-01-01"),
  },
  // plan-3: 湘南 ウルトラセルQ+ 顔全体
  {
    id: "price-3",
    planId: "plan-3",
    priceYen: 24800,
    priceType: "first",
    sourceUrl: "https://www.s-b-c.net/hifu/",
    confirmedDate: new Date("2024-11-18"),
    disclaimer: "初回限定価格",
    isActive: true,
    status: "published",
    updatedAt: new Date("2024-11-18"),
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "price-3b",
    planId: "plan-3",
    priceYen: 44800,
    priceType: "normal",
    sourceUrl: "https://www.s-b-c.net/hifu/",
    confirmedDate: new Date("2024-11-18"),
    disclaimer: null,
    isActive: true,
    status: "published",
    updatedAt: new Date("2024-11-18"),
    createdAt: new Date("2024-01-01"),
  },
  // plan-4: 湘南 ウルセラ 顔全体
  {
    id: "price-4",
    planId: "plan-4",
    priceYen: 130000,
    priceType: "normal",
    sourceUrl: "https://www.s-b-c.net/ulthera/",
    confirmedDate: new Date("2024-11-18"),
    disclaimer: null,
    isActive: true,
    status: "published",
    updatedAt: new Date("2024-11-18"),
    createdAt: new Date("2024-01-01"),
  },
  // plan-5: TCB ソノクイーン 全顔
  {
    id: "price-5",
    planId: "plan-5",
    priceYen: 24800,
    priceType: "first",
    sourceUrl: "https://tcb-clinic.com/hifu/",
    confirmedDate: new Date("2024-11-15"),
    disclaimer: "初回限定、オンラインカウンセリング予約限定",
    isActive: true,
    status: "published",
    updatedAt: new Date("2024-11-15"),
    createdAt: new Date("2024-01-01"),
  },
  // plan-6: TCB ソノクイーン 目元
  {
    id: "price-6",
    planId: "plan-6",
    priceYen: 30600,
    priceType: "normal",
    sourceUrl: "https://tcb-clinic.com/hifu/",
    confirmedDate: new Date("2024-11-15"),
    disclaimer: null,
    isActive: true,
    status: "published",
    updatedAt: new Date("2024-11-15"),
    createdAt: new Date("2024-01-01"),
  },
  // plan-7: 聖心 ウルセラ フルフェイス
  {
    id: "price-7",
    planId: "plan-7",
    priceYen: 264000,
    priceType: "normal",
    sourceUrl: "https://www.biyougeka.com/ulthera/",
    confirmedDate: new Date("2024-11-10"),
    disclaimer: null,
    isActive: true,
    status: "published",
    updatedAt: new Date("2024-11-10"),
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "price-7b",
    planId: "plan-7",
    priceYen: 198000,
    priceType: "monitor",
    sourceUrl: "https://www.biyougeka.com/ulthera/",
    confirmedDate: new Date("2024-11-10"),
    disclaimer: "モニター条件あり、詳細は要相談",
    isActive: true,
    status: "published",
    updatedAt: new Date("2024-11-10"),
    createdAt: new Date("2024-02-01"),
  },
  // plan-8: 聖心 ウルセラ 首
  {
    id: "price-8",
    planId: "plan-8",
    priceYen: 132000,
    priceType: "normal",
    sourceUrl: "https://www.biyougeka.com/ulthera/",
    confirmedDate: new Date("2024-11-10"),
    disclaimer: null,
    isActive: true,
    status: "published",
    updatedAt: new Date("2024-11-10"),
    createdAt: new Date("2024-02-01"),
  },
  // plan-9: 表参道 ダブロゴールド 全顔
  {
    id: "price-9",
    planId: "plan-9",
    priceYen: 65780,
    priceType: "normal",
    sourceUrl: "https://omotesando-skin.jp/hifu/",
    confirmedDate: new Date("2024-11-05"),
    disclaimer: null,
    isActive: true,
    status: "published",
    updatedAt: new Date("2024-11-05"),
    createdAt: new Date("2024-03-01"),
  },
  // plan-10: 共立大阪 ウルトラセルQ+ 顔全体
  {
    id: "price-10",
    planId: "plan-10",
    priceYen: 44000,
    priceType: "normal",
    sourceUrl: "https://www.kyoritsu-biyo.com/hifu/",
    confirmedDate: new Date("2024-11-01"),
    disclaimer: null,
    isActive: true,
    status: "published",
    updatedAt: new Date("2024-11-01"),
    createdAt: new Date("2024-01-01"),
  },
  // plan-11: 心斎橋フェミー ダブロゴールド 全顔
  {
    id: "price-11",
    planId: "plan-11",
    priceYen: 55000,
    priceType: "normal",
    sourceUrl: "https://www.femmy-c.com/hifu/",
    confirmedDate: new Date("2024-10-28"),
    disclaimer: null,
    isActive: true,
    status: "published",
    updatedAt: new Date("2024-10-28"),
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "price-11b",
    planId: "plan-11",
    priceYen: 39800,
    priceType: "first",
    sourceUrl: "https://www.femmy-c.com/hifu/",
    confirmedDate: new Date("2024-10-28"),
    disclaimer: "初回限定",
    isActive: true,
    status: "published",
    updatedAt: new Date("2024-10-28"),
    createdAt: new Date("2024-02-01"),
  },
  // plan-12: 横浜TA ダブロゴールド 全顔
  {
    id: "price-12",
    planId: "plan-12",
    priceYen: 54780,
    priceType: "normal",
    sourceUrl: "https://taclinic.jp/hifu/",
    confirmedDate: new Date("2024-10-25"),
    disclaimer: null,
    isActive: true,
    status: "published",
    updatedAt: new Date("2024-10-25"),
    createdAt: new Date("2024-03-01"),
  },
  // plan-13: 横浜TA ダブロゴールド フェイスライン
  {
    id: "price-13",
    planId: "plan-13",
    priceYen: 32780,
    priceType: "normal",
    sourceUrl: "https://taclinic.jp/hifu/",
    confirmedDate: new Date("2024-10-25"),
    disclaimer: null,
    isActive: true,
    status: "published",
    updatedAt: new Date("2024-10-25"),
    createdAt: new Date("2024-03-01"),
  },
];

// Helper functions
export function getPlansForClinic(clinicId: string): Plan[] {
  return mockPlans.filter((p) => p.clinicId === clinicId && p.status === "published");
}

export function getPlansForDevice(deviceId: string): Plan[] {
  return mockPlans.filter((p) => p.deviceId === deviceId && p.status === "published");
}

export function getPriceEntriesForPlan(planId: string): PriceEntry[] {
  return mockPriceEntries.filter(
    (pe) => pe.planId === planId && pe.isActive && pe.status === "published"
  );
}

export function getActivePriceEntry(planId: string, priceType?: string): PriceEntry | undefined {
  const entries = getPriceEntriesForPlan(planId);
  if (priceType) {
    return entries.find((pe) => pe.priceType === priceType);
  }
  return entries[0];
}

export function getPlansWithPrices(clinicId: string): PlanWithPrice[] {
  const plans = getPlansForClinic(clinicId);
  return plans.flatMap((plan) => {
    const priceEntries = getPriceEntriesForPlan(plan.id);
    return priceEntries.map((priceEntry) => ({
      ...plan,
      priceEntry,
    }));
  });
}
