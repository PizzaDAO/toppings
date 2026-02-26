export type Rarity = "common" | "uncommon" | "rare" | "superrare" | "epic" | "grail";

export interface Topping {
  sku: number;
  class: string;
  name: string;
  description: string;
  artist: string;
  artistTwitter?: string;
  artistDiscord?: string;
  artistIG?: string;
  rarity: Rarity;
  probability: number;
  image: string;
  nutrition: Record<string, number | undefined>;
}

export interface ToppingClass {
  name: string;
  slug: string;
  count: number;
  sampleImages: string[];
}
