"use client";

import type { CategoriaCatalogo } from "@/types";
import { CategoryFilterButton } from "./CategoryFilterButton";

type CategoryFilterProps = {
  categories: CategoriaCatalogo[];
  selectedCategory: string;
  onChange: (categorySlug: string) => void;
};

export function CategoryFilter({
  categories,
  selectedCategory,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="filter-pills" role="group" aria-label="Filtrar por categoria">
      <CategoryFilterButton
        active={selectedCategory === "todas"}
        onClick={() => onChange("todas")}
      >
        Todos
      </CategoryFilterButton>
      {categories.map((category) => (
        <CategoryFilterButton
          key={category.id}
          active={selectedCategory === category.slug}
          onClick={() => onChange(category.slug)}
        >
          {category.nome === "Presentes Personalizados" ? "Presentes" : category.nome}
        </CategoryFilterButton>
      ))}
    </div>
  );
}
