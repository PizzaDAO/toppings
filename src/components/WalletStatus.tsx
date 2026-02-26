"use client";

import { useAccount, useReadContract } from "wagmi";
import { RARE_PIZZAS_CONTRACT } from "@/lib/constants";

const BALANCE_OF_ABI = [
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export default function WalletStatus() {
  const { address, isConnected } = useAccount();

  const { data: balance } = useReadContract({
    address: RARE_PIZZAS_CONTRACT,
    abi: BALANCE_OF_ABI,
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
    <span className="inline-flex items-center gap-1 rounded-full bg-[#F97316]/20 px-3 py-1 text-sm font-medium text-[#F97316]">
      🍕 {balance.toString()} Rare Pizzas
    </span>
  );
}
