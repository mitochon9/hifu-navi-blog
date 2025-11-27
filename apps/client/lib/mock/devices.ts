import type { Device } from "./types";

export const mockDevices: Device[] = [
  {
    id: "device-1",
    nameOfficial: "ウルトラセルQ+",
    slug: "ultracel-q-plus",
    aliases: ["ウルトラセルQプラス", "Ultracel Q+", "ウルトラセル"],
    manufacturer: "Jeisys Medical",
    descriptionShort:
      "韓国製の人気HIFU機器。カートリッジ交換式で部位ごとに最適な深度での照射が可能。痛みが比較的少なく、ダウンタイムも短い。",
    tags: ["人気", "痛み少なめ", "リフトアップ", "たるみ改善"],
    status: "published",
    updatedAt: new Date("2024-11-01"),
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "device-2",
    nameOfficial: "ウルセラ",
    slug: "ulthera",
    aliases: ["Ulthera", "ウルセラシステム", "Ultherapy"],
    manufacturer: "Merz Aesthetics",
    descriptionShort:
      "FDA承認のHIFU機器の先駆け。高出力で効果が長持ちする反面、痛みを感じやすい。医療HIFUの定番として信頼性が高い。",
    tags: ["高効果", "FDA承認", "持続性", "定番"],
    status: "published",
    updatedAt: new Date("2024-10-15"),
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "device-3",
    nameOfficial: "ダブロゴールド",
    slug: "doublo-gold",
    aliases: ["DOUBLO GOLD", "ダブロ", "Doublo"],
    manufacturer: "Hironic",
    descriptionShort:
      "痛みを抑えながら効果を実感できるバランス型。日本での導入実績が豊富で、多くのクリニックで採用されている。",
    tags: ["バランス型", "痛み軽減", "国内実績多", "コスパ良"],
    status: "published",
    updatedAt: new Date("2024-11-10"),
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "device-4",
    nameOfficial: "ソノクイーン",
    slug: "sonoqueen",
    aliases: ["SONOQUEEN", "ソノクィーン"],
    manufacturer: "Newpong",
    descriptionShort:
      "目元専用カートリッジが特徴。細かい部位の施術に強みを持ち、アイリフトに定評がある。",
    tags: ["目元対応", "繊細な施術", "アイリフト"],
    status: "published",
    updatedAt: new Date("2024-09-20"),
    createdAt: new Date("2024-03-01"),
  },
  {
    id: "device-5",
    nameOfficial: "ハイフシャワー",
    slug: "hifu-shower",
    aliases: ["HIFUシャワー", "HIFU Shower"],
    manufacturer: null,
    descriptionShort:
      "浅い層へ広範囲に照射するタイプ。引き締め効果と肌質改善を同時に狙える。痛みが少なくダウンタイムもほぼなし。",
    tags: ["痛み少なめ", "肌質改善", "ダウンタイム短"],
    status: "published",
    updatedAt: new Date("2024-08-05"),
    createdAt: new Date("2024-04-01"),
  },
  {
    id: "device-6",
    nameOfficial: "ウルトラフォーマーMPT",
    slug: "ultraformer-mpt",
    aliases: ["Ultraformer MPT", "ウルトラフォーマー3", "UF3"],
    manufacturer: "Classys",
    descriptionShort:
      "最新のMPT技術搭載で、従来機より施術時間を短縮。高密度照射による強力なリフトアップ効果。",
    tags: ["最新技術", "施術時間短縮", "高密度", "リフトアップ"],
    status: "published",
    updatedAt: new Date("2024-11-15"),
    createdAt: new Date("2024-05-01"),
  },
];

export function getDeviceBySlug(slug: string): Device | undefined {
  return mockDevices.find((d) => d.slug === slug && d.status === "published");
}

export function getPublishedDevices(): Device[] {
  return mockDevices.filter((d) => d.status === "published");
}
