"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ToppingClass } from "@/lib/types";

interface ClassCardProps {
  toppingClass: ToppingClass;
}

function Thumbnail({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-md bg-[#1a1a1a] text-lg">
        🍕
      </div>
    );
  }

  return (
    <Image
      src={src}
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
      <div className="group rounded-xl bg-[#141414] p-4 transition-all duration-200 hover:scale-[1.02] hover:bg-[#1a1a1a]">
        <div className="grid grid-cols-2 gap-2">
          {toppingClass.sampleImages.map((img, i) => (
            <Thumbnail key={i} src={img} alt={`${toppingClass.name} sample ${i + 1}`} />
          ))}
        </div>
        <div className="mt-3">
          <h3 className="text-base font-semibold text-white">
            {toppingClass.name}
          </h3>
          <p className="text-sm text-[#a1a1aa]">
            {toppingClass.count} toppings
          </p>
        </div>
      </div>
    </Link>
  );
}
