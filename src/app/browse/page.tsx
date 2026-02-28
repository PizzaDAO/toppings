"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, Suspense } from "react";
import FilterBar from "@/components/FilterBar";
import ToppingCard from "@/components/ToppingCard";
import { getAllToppings } from "@/lib/toppings";

function BrowseContent() {
  const searchParams = useSearchParams();
  const classFilter = searchParams.get("class") || "";
  const rarityFilter = searchParams.get("rarity") || "";
  const searchFilter = searchParams.get("search") || "";

  const allToppings = getAllToppings();

  const filtered = useMemo(() => {
    let result = allToppings;

    if (classFilter) {
      result = result.filter((t) => t.class === classFilter);
    }

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
  }, [allToppings, classFilter, rarityFilter, searchFilter]);

  return (
    <>
      <FilterBar showClassFilter />
      <p className="mb-4 text-sm text-[#d4c5a9]">
        Showing {filtered.length} of {allToppings.length} toppings
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((t) => (
          <ToppingCard key={t.sku} topping={t} />
        ))}
      </div>
    </>
  );
}

export default function BrowsePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-white">
          Browse All Toppings
        </h1>
        <p className="text-[#d4c5a9]">
          Explore the entire collection. Filter by class, rarity, or search by
          name.
        </p>
      </div>

      <Suspense>
        <BrowseContent />
      </Suspense>
    </div>
  );
}
