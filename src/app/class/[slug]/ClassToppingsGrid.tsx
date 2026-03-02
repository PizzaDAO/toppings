"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, Suspense } from "react";
import FilterBar from "@/components/FilterBar";
import ToppingCard from "@/components/ToppingCard";
import type { Topping } from "@/lib/types";

interface ClassToppingsGridProps {
  toppings: Topping[];
}

function ClassToppingsGridInner({ toppings }: ClassToppingsGridProps) {
  const searchParams = useSearchParams();
  const rarityFilter = searchParams.get("rarity") || "";
  const searchFilter = searchParams.get("search") || "";

  const filtered = useMemo(() => {
    let result = toppings;

    if (rarityFilter) {
      result = result.filter((t) => t.rarity === rarityFilter);
    }

    if (searchFilter) {
      const query = searchFilter.toLowerCase();
      result = result.filter((t) =>
        t.name.toLowerCase().includes(query)
      );
    }

    return result;
  }, [toppings, rarityFilter, searchFilter]);

  return (
    <>
      <FilterBar />
      <p className="mb-4 text-sm text-[#7DD3E8]">
        Showing {filtered.length} of {toppings.length} toppings
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((t, i) => (
          <ToppingCard key={t.sku} topping={t} index={i} />
        ))}
      </div>
    </>
  );
}

export default function ClassToppingsGrid({ toppings }: ClassToppingsGridProps) {
  return (
    <Suspense>
      <ClassToppingsGridInner toppings={toppings} />
    </Suspense>
  );
}
