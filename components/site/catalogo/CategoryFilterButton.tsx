"use client";

import type { ReactNode } from "react";

type CategoryFilterButtonProps = {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
};

export function CategoryFilterButton({ active, onClick, children }: CategoryFilterButtonProps) {
  return (
    <button className={`pill ${active ? "active" : ""}`} onClick={onClick} type="button">
      {children}
    </button>
  );
}
