"use client";

import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";
import { RARE_PIZZAS_CONTRACT, ERC721_ENUMERABLE_ABI } from "@/lib/constants";

export default function WalletStatus() {
  const { address, isConnected } = useAccount();

  const { data: balance } = useReadContract({
    address: RARE_PIZZAS_CONTRACT,
    abi: ERC721_ENUMERABLE_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  if (!isConnected || !balance || balance === 0n) {
    return null;
  }

  return (
    <Link href="/my-toppings">
      <span className="inline-flex items-center gap-1 rounded-full bg-[#FFE135]/20 px-3 py-1 text-sm font-medium text-[#FFE135] transition-colors hover:bg-[#FFE135]/30">
        &#127829; {balance.toString()} Rare Pizzas
      </span>
    </Link>
  );
}
