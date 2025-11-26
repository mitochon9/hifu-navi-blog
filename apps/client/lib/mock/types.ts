// ============================================
// Enum definitions
// ============================================

export const BODY_PART = {
  face_full: "顔全体",
  cheek: "頬",
  jawline: "フェイスライン",
  neck: "首",
  eye: "目元",
  forehead: "額",
  other: "その他",
} as const;

export const UNIT_TYPE = {
  shots: "ショット",
  sessions: "回",
} as const;

export const PRICE_TYPE = {
  normal: "通常価格",
  first: "初回限定",
  monitor: "モニター価格",
  campaign: "キャンペーン",
} as const;

export const STATUS = {
  draft: "下書き",
  published: "公開",
  archived: "アーカイブ",
} as const;

export const PREFECTURE = {
  tokyo: "東京都",
  osaka: "大阪府",
  kanagawa: "神奈川県",
  aichi: "愛知県",
  fukuoka: "福岡県",
  hokkaido: "北海道",
  kyoto: "京都府",
  hyogo: "兵庫県",
  saitama: "埼玉県",
  chiba: "千葉県",
} as const;

// ============================================
// Type aliases from enums
// ============================================

export type BodyPart = keyof typeof BODY_PART;
export type UnitType = keyof typeof UNIT_TYPE;
export type PriceType = keyof typeof PRICE_TYPE;
export type Status = keyof typeof STATUS;
export type Prefecture = keyof typeof PREFECTURE;

// ============================================
// Entity types
// ============================================

export type Clinic = {
  id: string;
  name: string;
  slug: string;
  address: string;
  prefecture: Prefecture;
  city: string;
  nearestStation: string | null;
  geoLat: number | null;
  geoLng: number | null;
  officialUrl: string;
  descriptionShort: string | null;
  status: Status;
  updatedAt: Date;
  createdAt: Date;
};

export type Device = {
  id: string;
  nameOfficial: string;
  slug: string;
  aliases: string[];
  manufacturer: string | null;
  descriptionShort: string;
  tags: string[];
  status: Status;
  updatedAt: Date;
  createdAt: Date;
};

export type Plan = {
  id: string;
  clinicId: string;
  deviceId: string;
  bodyPart: BodyPart;
  shotsOrSessions: number;
  unitType: UnitType;
  planLabel: string;
  status: Status;
  updatedAt: Date;
  createdAt: Date;
};

export type PriceEntry = {
  id: string;
  planId: string;
  priceYen: number;
  priceType: PriceType;
  sourceUrl: string;
  confirmedDate: Date;
  disclaimer: string | null;
  isActive: boolean;
  status: Status;
  updatedAt: Date;
  createdAt: Date;
};

// ============================================
// Joined types for display
// ============================================

export type PlanWithPrice = Plan & {
  priceEntry: PriceEntry;
};

export type ClinicWithPlans = Clinic & {
  plans: PlanWithPrice[];
};

export type DeviceWithClinics = Device & {
  clinicCount: number;
  priceRange: {
    min: number;
    max: number;
  };
};
