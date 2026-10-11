"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCategoryManager } from "@/hooks/admin/useCategoryManager";
import type { CategoriaAdmin } from "@/types";
import { CategoryFormDialog } from "./CategoryFormDialog";
import { CategoryTable } from "./CategoryTable";

export function CategoryManager({ categories }: { categories: CategoriaAdmin[] }) {
  const manager = useCategoryManager();

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={manager.openNew}>
          <Plus className="h-4 w-4" />
          Nova categoria
        </Button>
      </div>
      <CategoryTable
        categories={categories}
        onEdit={manager.openEdit}
        onDeactivate={(category) => void manager.deactivate(category)}
      />
      <CategoryFormDialog manager={manager} />
    </>
  );
}
