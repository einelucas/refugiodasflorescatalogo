"use client";

import { Search, X } from "lucide-react";
import { useAdminSearch } from "./AdminSearchContext";

export function AdminSearchField({ label }: { label: string }) {
  const { query, setQuery } = useAdminSearch();
  return (
    <div role="search" className="relative w-full">
      <label htmlFor="admin-search" className="sr-only">Buscar em {label}</label>
      <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-muted-foreground" />
      <input
        id="admin-search"
        type="search"
        autoComplete="off"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={`Buscar em ${label.toLocaleLowerCase("pt-BR")}...`}
        className="h-10 w-full min-w-0 rounded-full border border-primary/10 bg-white pl-11 pr-10 text-sm text-foreground shadow-[0_2px_7px_rgba(84,32,95,0.10)] outline-none transition-colors placeholder:text-muted-foreground/80 focus:border-primary/30 focus:ring-2 focus:ring-primary/10 [&::-webkit-search-cancel-button]:hidden"
      />
      {query && (
        <button
          type="button"
          aria-label="Limpar busca"
          title="Limpar busca"
          onClick={() => setQuery("")}
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
