"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";

type CatalogSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function CatalogSearchBar({ value, onChange }: CatalogSearchBarProps) {
  return (
    <label className="search-wrap">
      <MagnifyingGlass className="search-icon" size={17} weight="bold" aria-hidden="true" />
      <input
        type="search"
        className="search-input"
        placeholder="Buscar produto..."
        value={value}
        onChange={(evento) => onChange(evento.target.value)}
        aria-label="Buscar produto"
      />
    </label>
  );
}
