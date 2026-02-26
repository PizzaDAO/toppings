"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import RarityBadge from "./RarityBadge";
import type { Topping } from "@/lib/types";

interface ToppingCardProps {
  topping: Topping;
}

export default function ToppingCard({ topping }: ToppingCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link href={`/topping/${topping.sku}`}>
      <div className="group rounded-xl bg-[#141414] p-3 transition-all duration-200 hover:scale-[1.02] hover:bg-[#1a1a1a]">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[#1a1a1a]">
          {imgError ? (
            <div className="flex h-full w-full items-center justify-center bg-[#1a1a1a] text-6xl">
              🍕
            </div>
          ) : (
            <Image
              src={topping.image}
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
          <p className="truncate text-xs text-[#a1a1aa]">{topping.artist}</p>
          <RarityBadge rarity={topping.rarity} />
        </div>
      </div>
    </Link>
  );
}
