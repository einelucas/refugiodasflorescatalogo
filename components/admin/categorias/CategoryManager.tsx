"use client";

import { Plus } from "lucide-react";
import { useAdminSearch } from "@/components/admin/layout/AdminSearchContext";
import { correspondeBusca } from "@/lib/admin/busca";
import { AdminSearchEmptyState } from "@/components/admin/layout/AdminSearchEmptyState";
import { Button } from "@/components/ui/button";
import { useCategoryManager } from "@/hooks/admin/useCategoryManager";
import type { CategoriaAdmin } from "@/types";
import { CategoryFormDialog } from "./CategoryFormDialog";
import { CategoryTable } from "./CategoryTable";

export function CategoryManager({ categories }: { categories: CategoriaAdmin[] }) {
  const manager = useCategoryManager();
  const { query } = useAdminSearch();
  const filtradas = categories.filter((categoria) => correspondeBusca(query, categoria.nome, categoria.titulo, categoria.slug, categoria.subtitulo, ...categoria.aliases));

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={manager.openNew}>
          <Plus className="h-4 w-4" />
          Nova categoria
        </Button>
      </div>
      {filtradas.length ? <CategoryTable
        categories={filtradas}
        onEdit={manager.openEdit}
        onDeactivate={(category) => void manager.deactivate(category)}
      /> : <AdminSearchEmptyState query={query} />}
      <CategoryFormDialog manager={manager} />
    </>
  );
}
