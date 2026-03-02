"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import RarityBadge from "./RarityBadge";
import type { Topping } from "@/lib/types";
import { getImageUrl, getWoodTileUrl } from "@/lib/constants";
import { useOwnedToppingsMap } from "@/hooks/useOwnedToppingsMap";

interface ToppingCardProps {
  topping: Topping;
  index?: number;
}

export default function ToppingCard({ topping, index = 0 }: ToppingCardProps) {
  const [imgError, setImgError] = useState(false);
  const tileIndex = index || (topping.sku % 24);
  const ownedMap = useOwnedToppingsMap();
  const owned = ownedMap.get(topping.sku);

  return (
    <Link href={`/topping/${topping.sku}`}>
      <div
        className="group relative rounded-xl bg-cover bg-center p-3 transition-all duration-200 hover:scale-[1.02] hover:brightness-110"
        style={{ backgroundImage: `url(${getWoodTileUrl(tileIndex)})` }}
      >
        {owned && owned.count > 0 && (
          <div className="absolute right-2 top-2 z-10 flex h-7 min-w-7 items-center justify-center rounded-full bg-[#FFE135] px-2 text-xs font-bold text-black shadow-lg">
            x{owned.count}
          </div>
        )}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg">
          {imgError ? (
            <div className="flex h-full w-full items-center justify-center bg-[#111] text-6xl">
              🍕
            </div>
          ) : (
            <Image
              src={getImageUrl(topping.image)}
              alt={topping.name}
              width={400}
              height={400}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          )}
        </div>
        <div className="mt-3 space-y-2">
          <h3 className="truncate text-sm font-semibold text-white">
            {topping.name}
          </h3>
          <p className="truncate text-xs text-[#7DD3E8]">{topping.artist}</p>
          <RarityBadge rarity={topping.rarity} />
        </div>
      </div>
    </Link>
  );
}
