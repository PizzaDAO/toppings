import { RARITY_COLORS } from "@/lib/constants";
import type { Rarity } from "@/lib/types";

interface RarityBadgeProps {
  rarity: Rarity;
}

const RARITY_LABELS: Record<Rarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  superrare: "Super Rare",
  epic: "Epic",
  grail: "Grail",
};

export default function RarityBadge({ rarity }: RarityBadgeProps) {
  const color = RARITY_COLORS[rarity] || "#9CA3AF";

  return (
    <span
      className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
      style={{
        backgroundColor: `${color}33`,
        color: color,
      }}
    >
      {RARITY_LABELS[rarity]}
    </span>
  );
}
