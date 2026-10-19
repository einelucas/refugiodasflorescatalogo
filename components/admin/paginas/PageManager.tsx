"use client";

import { Plus } from "lucide-react";
import { useAdminSearch } from "@/components/admin/layout/AdminSearchContext";
import { correspondeBusca } from "@/lib/admin/busca";
import { AdminSearchEmptyState } from "@/components/admin/layout/AdminSearchEmptyState";
import { Button } from "@/components/ui/button";
import { usePageManager } from "@/hooks/admin/usePageManager";
import type { Pagina } from "@/types";
import { PageFormDialog } from "./PageFormDialog";
import { PageTable } from "./PageTable";

export function PageManager({ pages }: { pages: Pagina[] }) {
  const manager = usePageManager();
  const { query } = useAdminSearch();
  const filtradas = pages.filter((pagina) => correspondeBusca(query, pagina.titulo, pagina.slug));
  return (
    <>
      <div className="flex justify-end">
        <Button onClick={manager.openNew}>
          <Plus className="h-4 w-4" />
          Nova página
        </Button>
      </div>
      {filtradas.length ? <PageTable
        pages={filtradas}
        onEdit={manager.openEdit}
        onRemove={(page) => void manager.remove(page)}
      /> : <AdminSearchEmptyState query={query} />}
      <PageFormDialog manager={manager} />
    </>
  );
}
