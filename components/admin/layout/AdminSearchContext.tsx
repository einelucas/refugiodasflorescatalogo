"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

// Pesquisa local, reativa e limitada à rota administrativa atual.
// O provider recebe key={pathname} no AdminShell para limpar a busca ao trocar de aba.
type AdminSearchValue = { query: string; setQuery: (value: string) => void };
const AdminSearchContext = createContext<AdminSearchValue | null>(null);

export function AdminSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const value = useMemo(() => ({ query, setQuery }), [query]);
  return <AdminSearchContext.Provider value={value}>{children}</AdminSearchContext.Provider>;
}

export function useAdminSearch() {
  const context = useContext(AdminSearchContext);
  if (!context) throw new Error("useAdminSearch precisa do AdminSearchProvider.");
  return context;
}
