"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import RarityBadge from "./RarityBadge";
import type { Topping } from "@/lib/types";
import { getImageUrl } from "@/lib/constants";

interface ToppingCardProps {
  topping: Topping;
}

export default function ToppingCard({ topping }: ToppingCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link href={`/topping/${topping.sku}`}>
      <div className="group rounded-xl bg-[#3d2b1f] p-3 transition-all duration-200 hover:scale-[1.02] hover:bg-[#5c4033]">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[#2a1f14]">
          {imgError ? (
            <div className="flex h-full w-full items-center justify-center bg-[#2a1f14] text-6xl">
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
          <p className="truncate text-xs text-[#d4c5a9]">{topping.artist}</p>
          <RarityBadge rarity={topping.rarity} />
        </div>
      </div>
    </Link>
  );
}
