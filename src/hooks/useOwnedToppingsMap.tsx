"use client";

import { createContext, useContext, useMemo } from "react";
import { useWalletToppings } from "./useWalletToppings";
import type { OwnedTopping } from "@/lib/types";

type OwnedToppingsMap = Map<number, OwnedTopping>;

const OwnedToppingsContext = createContext<OwnedToppingsMap>(new Map());

export function OwnedToppingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ownedToppings } = useWalletToppings();

  const map = useMemo(() => {
    const m = new Map<number, OwnedTopping>();
    for (const owned of ownedToppings) {
      m.set(owned.topping.sku, owned);
    }
    return m;
  }, [ownedToppings]);

  return (
    <OwnedToppingsContext.Provider value={map}>
      {children}
    </OwnedToppingsContext.Provider>
  );
}

export function useOwnedToppingsMap(): OwnedToppingsMap {
  return useContext(OwnedToppingsContext);
}
