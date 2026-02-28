"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ToppingClass } from "@/lib/types";
import { getImageUrl } from "@/lib/constants";

interface ClassCardProps {
  toppingClass: ToppingClass;
}

function Thumbnail({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-md bg-[#2a1f14] text-lg">
        🍕
      </div>
    );
  }

  return (
    <Image
      src={getImageUrl(src)}
      alt={alt}
      width={100}
      height={100}
      className="aspect-square w-full rounded-md object-cover"
      onError={() => setError(true)}
    />
  );
}

export default function ClassCard({ toppingClass }: ClassCardProps) {
  return (
    <Link href={`/class/${toppingClass.slug}`}>
      <div className="group rounded-xl bg-[#3d2b1f] p-4 transition-all duration-200 hover:scale-[1.02] hover:bg-[#5c4033]">
        <div className="grid grid-cols-2 gap-2">
          {toppingClass.sampleImages.map((img, i) => (
            <Thumbnail key={i} src={img} alt={`${toppingClass.name} sample ${i + 1}`} />
          ))}
        </div>
        <div className="mt-3">
          <h3 className="text-base font-semibold text-white">
            {toppingClass.name}
          </h3>
          <p className="text-sm text-[#d4c5a9]">
            {toppingClass.count} toppings
          </p>
        </div>
      </div>
    </Link>
  );
}
