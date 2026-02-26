import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Rare Pizzas Toppings",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "placeholder",
  chains: [mainnet],
  ssr: true,
});
