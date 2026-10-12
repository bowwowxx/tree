"use client";

import { createContext, useContext, type ReactNode } from "react";

type VillageConfig = { ownerLogin: string; doveRepo: string; repo: string; ownerHouseStyle: "cottage" | "fisherman" };
const Context = createContext<VillageConfig>({ ownerLogin: "bowwowxx", doveRepo: "", repo: "bowwowxx/tree", ownerHouseStyle: "cottage" });

export function VillageConfigProvider({ children, ...config }: VillageConfig & { children: ReactNode }) {
  return <Context.Provider value={config}>{children}</Context.Provider>;
}

export function useVillageConfig() {
  return useContext(Context);
}
