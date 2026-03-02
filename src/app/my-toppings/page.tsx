"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useWalletToppings } from "@/hooks/useWalletToppings";
import { getClasses, getRarities } from "@/lib/toppings";
import { getImageUrl, getWoodTileUrl, RARITY_COLORS, OPENSEA_BASE_URL } from "@/lib/constants";
import RarityBadge from "@/components/RarityBadge";
import type { OwnedTopping } from "@/lib/types";

const ConnectButton = dynamic(
  () => import("@rainbow-me/rainbowkit").then((mod) => mod.ConnectButton),
  { ssr: false }
);

const RARITY_LABELS: Record<string, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  superrare: "Super Rare",
  epic: "Epic",
  grail: "Grail",
};

function WalletPrompt() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20">
      <div className="text-6xl">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FFE135"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white">Connect Your Wallet</h2>
      <p className="max-w-md text-center text-[#7DD3E8]">
        Connect your wallet to see which toppings you own through your Rare
        Pizzas NFTs.
      </p>
      <ConnectButton />
    </div>
  );
}

function LoadingSkeleton({
  loaded,
  total,
}: {
  loaded: number;
  total: number;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-[#111] p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#FFE135] border-t-transparent" />
          <p className="text-[#7DD3E8]">
            Loading pizza {loaded} of {total}...
          </p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#333]">
          <div
            className="h-full rounded-full bg-[#FFE135] transition-all duration-300"
            style={{
              width: total > 0 ? `${(loaded / total) * 100}%` : "0%",
            }}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: Math.min(8, total || 4) }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl bg-[#3d2b1f] p-3"
          >
            <div className="aspect-square w-full rounded-lg bg-[#111]" />
            <div className="mt-3 space-y-2">
              <div className="h-4 w-2/3 rounded bg-[#111]" />
              <div className="h-3 w-1/2 rounded bg-[#111]" />
              <div className="h-5 w-20 rounded-full bg-[#111]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OwnedToppingCard({
  owned,
  index,
}: {
  owned: OwnedTopping;
  index: number;
}) {
  const [imgError, setImgError] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const tileIndex = index || (owned.topping.sku % 24);

  return (
    <div
      className="group"
      style={{ perspective: "1000px" }}
    >
      <div
        className="relative transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front face */}
        <div style={{ backfaceVisibility: "hidden" }}>
          <Link href={`/topping/${owned.topping.sku}`}>
            <div
              className="relative rounded-xl bg-cover bg-center p-3 transition-all duration-200 hover:scale-[1.02] hover:brightness-110"
              style={{ backgroundImage: `url(${getWoodTileUrl(tileIndex)})` }}
            >
              {owned.count > 1 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsFlipped(true);
                  }}
                  className="absolute right-2 top-2 z-10 flex h-7 min-w-7 items-center justify-center rounded-full bg-[#FFE135] px-2 text-xs font-bold text-black shadow-lg transition-transform hover:scale-110"
                  aria-label="Show pizzas with this topping"
                >
                  x{owned.count}
                </button>
              )}
              <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                {imgError ? (
                  <div className="flex h-full w-full items-center justify-center bg-[#111] text-6xl">
                    <span role="img" aria-label="pizza">&#127829;</span>
                  </div>
                ) : (
                  <Image
                    src={getImageUrl(owned.topping.image)}
                    alt={owned.topping.name}
                    width={400}
                    height={400}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    onError={() => setImgError(true)}
                  />
                )}
              </div>
              <div className="mt-3 space-y-2">
                <h3 className="truncate text-sm font-semibold text-white">
                  {owned.topping.name}
                </h3>
                <p className="truncate text-xs text-[#7DD3E8]">
                  {owned.topping.class}
                </p>
                <RarityBadge rarity={owned.topping.rarity} />
              </div>
            </div>
          </Link>
        </div>

        {/* Back face */}
        <div
          className="absolute inset-0 rounded-xl bg-cover bg-center p-4"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            backgroundImage: `url(${getWoodTileUrl(tileIndex)})`,
          }}
        >
          <div className="flex h-full flex-col">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="truncate text-sm font-semibold text-white">
                {owned.topping.name}
              </h3>
              <button
                onClick={() => setIsFlipped(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/60 text-white/80 transition-colors hover:bg-black/80 hover:text-white"
                aria-label="Flip back"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            </div>
            <p className="mb-2 text-xs text-[#7DD3E8]">
              Found on {owned.tokenIds.length} pizza{owned.tokenIds.length !== 1 ? "s" : ""}:
            </p>
            <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
              {owned.tokenIds.map((tokenId) => (
                <a
                  key={tokenId}
                  href={`${OPENSEA_BASE_URL}/${tokenId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-black/40 px-3 py-2 text-xs text-white transition-colors hover:bg-black/60"
                >
                  <span>Pizza #{tokenId}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto shrink-0 text-[#7DD3E8]">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NoPizzasMessage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <p className="text-5xl">&#127829;</p>
      <h2 className="text-2xl font-bold text-white">No Rare Pizzas Found</h2>
      <p className="max-w-md text-center text-[#7DD3E8]">
        This wallet doesn&apos;t hold any Rare Pizzas NFTs. Toppings are
        discovered from the pizzas in your wallet.
      </p>
      <Link
        href="/browse"
        className="mt-2 rounded-lg bg-[#FFE135] px-6 py-2 font-medium text-black transition-colors hover:bg-[#FFE135]/80"
      >
        Browse All Toppings
      </Link>
    </div>
  );
}

export default function MyToppingsPage() {
  const { isConnected } = useAccount();
  const {
    isLoading,
    isLoadingOnChain,
    isLoadingMetadata,
    error,
    pizzas,
    ownedToppings,
    totalPizzas,
    loadedPizzas,
    unmatchedTraits,
  } = useWalletToppings();

  const [classFilter, setClassFilter] = useState("");
  const [rarityFilter, setRarityFilter] = useState("");

  const classes = getClasses();
  const rarities = getRarities();

  // Get classes that actually appear in owned toppings
  const ownedClasses = useMemo(() => {
    const classSet = new Set(ownedToppings.map((o) => o.topping.class));
    return classes.filter((c) => classSet.has(c.name));
  }, [ownedToppings, classes]);

  const filteredToppings = useMemo(() => {
    let result = ownedToppings;
    if (classFilter) {
      result = result.filter((o) => o.topping.class === classFilter);
    }
    if (rarityFilter) {
      result = result.filter((o) => o.topping.rarity === rarityFilter);
    }
    return result;
  }, [ownedToppings, classFilter, rarityFilter]);

  // Sort by count descending, then by rarity
  const sortedToppings = useMemo(() => {
    const rarityOrder: Record<string, number> = {
      grail: 5,
      epic: 4,
      superrare: 3,
      rare: 2,
      uncommon: 1,
      common: 0,
    };
    return [...filteredToppings].sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return (
        (rarityOrder[b.topping.rarity] ?? 0) -
        (rarityOrder[a.topping.rarity] ?? 0)
      );
    });
  }, [filteredToppings]);

  // Rarity breakdown stats
  const rarityBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of ownedToppings) {
      const r = o.topping.rarity;
      counts[r] = (counts[r] || 0) + 1;
    }
    return counts;
  }, [ownedToppings]);

  if (!isConnected) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">My Toppings</h1>
          <p className="text-[#7DD3E8]">
            See which toppings you own through your Rare Pizzas.
          </p>
        </div>
        <WalletPrompt />
      </div>
    );
  }

  if (isLoadingOnChain) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">My Toppings</h1>
          <p className="text-[#7DD3E8]">Reading your wallet...</p>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-[#111] p-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#FFE135] border-t-transparent" />
          <p className="text-[#7DD3E8]">Checking for Rare Pizzas...</p>
        </div>
      </div>
    );
  }

  if (totalPizzas === 0 && !isLoading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">My Toppings</h1>
          <p className="text-[#7DD3E8]">
            See which toppings you own through your Rare Pizzas.
          </p>
        </div>
        <NoPizzasMessage />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-white">My Toppings</h1>
        <p className="text-[#7DD3E8]">
          See which toppings you own through your Rare Pizzas.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {isLoadingMetadata && (
        <LoadingSkeleton loaded={loadedPizzas} total={totalPizzas} />
      )}

      {!isLoadingMetadata && ownedToppings.length === 0 && totalPizzas > 0 && (
        <div className="rounded-xl bg-[#111] p-6">
          <p className="text-[#7DD3E8]">
            Found {totalPizzas} pizza{totalPizzas !== 1 ? "s" : ""} but could
            not load topping data.{" "}
            {error && <span className="text-red-400">{error}</span>}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 rounded-lg bg-[#FFE135] px-4 py-2 text-sm font-medium text-black hover:bg-[#FFE135]/80"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoadingMetadata && ownedToppings.length > 0 && (
        <>
          {/* Summary */}
          <div className="mb-6 rounded-xl bg-[#111] p-6">
            <h2 className="mb-3 text-xl font-semibold text-white">
              {ownedToppings.length} unique topping
              {ownedToppings.length !== 1 ? "s" : ""} across {totalPizzas}{" "}
              pizza{totalPizzas !== 1 ? "s" : ""}
            </h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(rarityBreakdown).map(([rarity, count]) => (
                <span
                  key={rarity}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: `${RARITY_COLORS[rarity] || "#9CA3AF"}55`,
                    color: RARITY_COLORS[rarity] || "#9CA3AF",
                  }}
                >
                  {count} {RARITY_LABELS[rarity] || rarity}
                </span>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="rounded-lg border border-[#333] bg-[#111] px-3 py-2 text-sm text-[#7DD3E8] outline-none focus:border-[#FFE135]"
            >
              <option value="">All Classes</option>
              {ownedClasses.map((c) => (
                <option key={c.slug} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={rarityFilter}
              onChange={(e) => setRarityFilter(e.target.value)}
              className="rounded-lg border border-[#333] bg-[#111] px-3 py-2 text-sm text-[#7DD3E8] outline-none focus:border-[#FFE135]"
            >
              <option value="">All Rarities</option>
              {rarities.map((r) => (
                <option key={r} value={r}>
                  {RARITY_LABELS[r] || r}
                </option>
              ))}
            </select>

            <p className="text-sm text-[#7DD3E8]">
              Showing {sortedToppings.length} of {ownedToppings.length} toppings
            </p>
          </div>

          {/* Topping grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedToppings.map((owned, i) => (
              <OwnedToppingCard
                key={owned.topping.sku}
                owned={owned}
                index={i}
              />
            ))}
          </div>

          {/* Unmatched traits debug info */}
          {unmatchedTraits.length > 0 && (
            <details className="mt-8">
              <summary className="cursor-pointer text-sm text-[#555] hover:text-[#7DD3E8]">
                {unmatchedTraits.length} unmatched trait
                {unmatchedTraits.length !== 1 ? "s" : ""} (debug info)
              </summary>
              <div className="mt-2 rounded-xl bg-[#111] p-4">
                <div className="space-y-1">
                  {unmatchedTraits.map((t, i) => (
                    <p key={i} className="text-xs text-[#555]">
                      {t.trait_type}: {t.value}
                    </p>
                  ))}
                </div>
              </div>
            </details>
          )}
        </>
      )}

      {/* Show progressive results while still loading */}
      {isLoadingMetadata && ownedToppings.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Found so far: {ownedToppings.length} unique toppings
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ownedToppings.map((owned, i) => (
              <OwnedToppingCard
                key={owned.topping.sku}
                owned={owned}
                index={i}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
