"use client";

import Image from "next/image";
import { useState } from "react";

interface ToppingImageProps {
  image: string;
  name: string;
}

export default function ToppingImage({ image, name }: ToppingImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="flex h-[600px] w-full max-w-[600px] items-center justify-center rounded-xl bg-[#141414] text-8xl">
        🍕
      </div>
    );
  }

  return (
    <Image
      src={image}
      alt={name}
      width={600}
      height={600}
      className="h-auto w-full max-w-[600px] rounded-xl"
      priority
      onError={() => setError(true)}
    />
  );
}
