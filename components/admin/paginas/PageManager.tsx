"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageManager } from "@/hooks/admin/usePageManager";
import type { Pagina } from "@/types";
import { PageFormDialog } from "./PageFormDialog";
import { PageTable } from "./PageTable";

export function PageManager({ pages }: { pages: Pagina[] }) {
  const manager = usePageManager();
  return (
    <>
      <div className="flex justify-end">
        <Button onClick={manager.openNew}>
          <Plus className="h-4 w-4" />
          Nova página
        </Button>
      </div>
      <PageTable
        pages={pages}
        onEdit={manager.openEdit}
        onRemove={(page) => void manager.remove(page)}
      />
      <PageFormDialog manager={manager} />
    </>
  );
}
