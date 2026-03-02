"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import {
  RARE_PIZZAS_CONTRACT,
  ERC721_ENUMERABLE_ABI,
  EXCLUDED_TRAIT_TYPES,
  IPFS_GATEWAY,
} from "@/lib/constants";
import { matchTopping } from "@/lib/toppings";
import type {
  Topping,
  OwnedTopping,
  PizzaTokenData,
  NFTMetadata,
  NFTAttribute,
} from "@/lib/types";

const MAX_CONCURRENT_FETCHES = 5;
const SESSION_STORAGE_PREFIX = "rp-meta-";

const IPFS_GATEWAYS = [
  "https://dweb.link/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://ipfs.io/ipfs/",
];

function ipfsToHttp(uri: string, gateway: string = IPFS_GATEWAYS[0]): string {
  if (uri.startsWith("ipfs://")) {
    return `${gateway}${uri.slice(7)}`;
  }
  return uri;
}

function getCachedMetadata(tokenId: number): NFTMetadata | null {
  try {
    const cached = sessionStorage.getItem(
      `${SESSION_STORAGE_PREFIX}${tokenId}`
    );
    if (cached) return JSON.parse(cached);
  } catch {
    // sessionStorage not available or parse error
  }
  return null;
}

function setCachedMetadata(tokenId: number, metadata: NFTMetadata): void {
  try {
    sessionStorage.setItem(
      `${SESSION_STORAGE_PREFIX}${tokenId}`,
      JSON.stringify(metadata)
    );
  } catch {
    // sessionStorage full or not available
  }
}

async function fetchMetadataWithRetry(
  uri: string,
  retries = 2
): Promise<NFTMetadata> {
  // Try each gateway in order
  for (const gateway of IPFS_GATEWAYS) {
    const url = ipfsToHttp(uri, gateway);
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as NFTMetadata;
      } catch (err) {
        if (attempt === retries) break; // try next gateway
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }
  throw new Error("All IPFS gateways failed");
}

/** Concurrency-limited batch fetch */
async function fetchAllMetadata(
  tokenIds: number[],
  tokenURIs: string[],
  onProgress: (completed: number, tokenData: PizzaTokenData) => void
): Promise<PizzaTokenData[]> {
  const results: PizzaTokenData[] = [];
  let completed = 0;

  const queue = tokenIds.map((tokenId, i) => ({
    tokenId,
    uri: tokenURIs[i],
  }));

  const workers = Array.from(
    { length: Math.min(MAX_CONCURRENT_FETCHES, queue.length) },
    async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (!item) break;

        const { tokenId, uri } = item;

        // Check cache first
        let metadata = getCachedMetadata(tokenId);
        if (!metadata) {
          try {
            metadata = await fetchMetadataWithRetry(uri);
            setCachedMetadata(tokenId, metadata);
          } catch {
            metadata = null;
          }
        }

        // Parse toppings from attributes
        const toppings: Topping[] = [];
        const unmatchedTraits: NFTAttribute[] = [];

        if (metadata?.attributes) {
          for (const attr of metadata.attributes) {
            if (EXCLUDED_TRAIT_TYPES.has(attr.trait_type)) continue;
            const matched = matchTopping(attr);
            if (matched) {
              toppings.push(matched);
            } else {
              unmatchedTraits.push(attr);
            }
          }
        }

        const data: PizzaTokenData = {
          tokenId,
          metadata,
          toppings,
          unmatchedTraits,
        };

        results.push(data);
        completed++;
        onProgress(completed, data);
      }
    }
  );

  await Promise.all(workers);
  return results;
}

export interface UseWalletToppingsReturn {
  isLoading: boolean;
  isLoadingOnChain: boolean;
  isLoadingMetadata: boolean;
  error: string | null;
  pizzas: PizzaTokenData[];
  ownedToppings: OwnedTopping[];
  totalPizzas: number;
  loadedPizzas: number;
  unmatchedTraits: NFTAttribute[];
}

export function useWalletToppings(): UseWalletToppingsReturn {
  const { address, isConnected } = useAccount();

  const [pizzas, setPizzas] = useState<PizzaTokenData[]>([]);
  const [loadedPizzas, setLoadedPizzas] = useState(0);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  // Step 1: Get balance
  const {
    data: balance,
    isLoading: isLoadingBalance,
    error: balanceError,
  } = useReadContract({
    address: RARE_PIZZAS_CONTRACT,
    abi: ERC721_ENUMERABLE_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  const totalPizzas = balance ? Number(balance) : 0;

  // Step 2: Get all token IDs via tokenOfOwnerByIndex
  const tokenIndexContracts = useMemo(() => {
    if (!address || !totalPizzas) return [];
    return Array.from({ length: totalPizzas }, (_, i) => ({
      address: RARE_PIZZAS_CONTRACT,
      abi: ERC721_ENUMERABLE_ABI,
      functionName: "tokenOfOwnerByIndex" as const,
      args: [address, BigInt(i)] as const,
    }));
  }, [address, totalPizzas]);

  const {
    data: tokenIdResults,
    isLoading: isLoadingTokenIds,
    error: tokenIdsError,
  } = useReadContracts({
    contracts: tokenIndexContracts,
    batchSize: 0,
    query: {
      enabled: tokenIndexContracts.length > 0,
    },
  });

  const tokenIds = useMemo(() => {
    if (!tokenIdResults) return [];
    return tokenIdResults
      .filter((r) => r.status === "success" && r.result !== undefined)
      .map((r) => Number(r.result as bigint));
  }, [tokenIdResults]);

  // Step 3: Get tokenURI for each token
  const tokenURIContracts = useMemo(() => {
    if (!tokenIds.length) return [];
    return tokenIds.map((id) => ({
      address: RARE_PIZZAS_CONTRACT,
      abi: ERC721_ENUMERABLE_ABI,
      functionName: "tokenURI" as const,
      args: [BigInt(id)] as const,
    }));
  }, [tokenIds]);

  const {
    data: tokenURIResults,
    isLoading: isLoadingURIs,
    error: uriError,
  } = useReadContracts({
    contracts: tokenURIContracts,
    batchSize: 0,
    query: {
      enabled: tokenURIContracts.length > 0,
    },
  });

  const tokenURIs = useMemo(() => {
    if (!tokenURIResults) return [];
    return tokenURIResults
      .filter((r) => r.status === "success" && r.result !== undefined)
      .map((r) => r.result as string);
  }, [tokenURIResults]);

  // Step 4: Fetch IPFS metadata
  const fetchMetadata = useCallback(async () => {
    if (!tokenIds.length || !tokenURIs.length) return;
    if (tokenIds.length !== tokenURIs.length) return;

    setIsLoadingMetadata(true);
    setMetadataError(null);
    setPizzas([]);
    setLoadedPizzas(0);

    try {
      const results = await fetchAllMetadata(
        tokenIds,
        tokenURIs,
        (completed, data) => {
          setLoadedPizzas(completed);
          setPizzas((prev) => [...prev, data]);
        }
      );
      // Final set with all results to ensure consistency
      setPizzas(results);
      setLoadedPizzas(results.length);
    } catch (err) {
      setMetadataError(
        err instanceof Error ? err.message : "Failed to load metadata"
      );
    } finally {
      setIsLoadingMetadata(false);
    }
  }, [tokenIds, tokenURIs]);

  useEffect(() => {
    if (tokenIds.length > 0 && tokenURIs.length === tokenIds.length) {
      fetchMetadata();
    }
  }, [tokenIds.length, tokenURIs.length, fetchMetadata]);

  // Reset when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setPizzas([]);
      setLoadedPizzas(0);
      setIsLoadingMetadata(false);
      setMetadataError(null);
    }
  }, [isConnected]);

  // Aggregate owned toppings with counts
  const ownedToppings = useMemo(() => {
    const map = new Map<
      number,
      { topping: Topping; count: number; tokenIds: number[] }
    >();
    for (const pizza of pizzas) {
      for (const t of pizza.toppings) {
        const existing = map.get(t.sku);
        if (existing) {
          existing.count++;
          existing.tokenIds.push(pizza.tokenId);
        } else {
          map.set(t.sku, {
            topping: t,
            count: 1,
            tokenIds: [pizza.tokenId],
          });
        }
      }
    }
    return Array.from(map.values());
  }, [pizzas]);

  // Aggregate unmatched traits
  const unmatchedTraits = useMemo(() => {
    const traits: NFTAttribute[] = [];
    for (const pizza of pizzas) {
      traits.push(...pizza.unmatchedTraits);
    }
    return traits;
  }, [pizzas]);

  const isLoadingOnChain =
    isLoadingBalance || isLoadingTokenIds || isLoadingURIs;

  const error =
    metadataError ||
    (balanceError ? balanceError.message : null) ||
    (tokenIdsError ? tokenIdsError.message : null) ||
    (uriError ? uriError.message : null);

  return {
    isLoading: isLoadingOnChain || isLoadingMetadata,
    isLoadingOnChain,
    isLoadingMetadata,
    error,
    pizzas,
    ownedToppings,
    totalPizzas,
    loadedPizzas,
    unmatchedTraits,
  };
}
