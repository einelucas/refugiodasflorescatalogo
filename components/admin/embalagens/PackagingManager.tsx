"use client";

import { Plus } from "lucide-react";
import { useAdminSearch } from "@/components/admin/layout/AdminSearchContext";
import { correspondeBusca } from "@/lib/admin/busca";
import { AdminSearchEmptyState } from "@/components/admin/layout/AdminSearchEmptyState";
import { Button } from "@/components/ui/button";
import { usePackagingManager } from "@/hooks/admin/usePackagingManager";
import type { Embalagem } from "@/types";
import { PackagingFormDialog } from "./PackagingFormDialog";
import { PackagingTable } from "./PackagingTable";

export function PackagingManager({ packages }: { packages: Embalagem[] }) {
  const manager = usePackagingManager();
  const { query } = useAdminSearch();
  const filtradas = packages.filter((embalagem) => correspondeBusca(query, embalagem.nome, embalagem.alturaCm, embalagem.larguraCm, embalagem.comprimentoCm, embalagem.pesoTaraKg));
  return (
    <>
      <div className="flex justify-end">
        <Button onClick={manager.openNew}>
          <Plus className="h-4 w-4" />
          Novo modelo
        </Button>
      </div>
      {filtradas.length ? <PackagingTable
        packages={filtradas}
        onEdit={manager.openEdit}
        onRemove={(packaging) => void manager.remove(packaging)}
      /> : <AdminSearchEmptyState query={query} />}
      <PackagingFormDialog manager={manager} />
    </>
  );
}
