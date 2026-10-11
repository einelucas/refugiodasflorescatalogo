"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePackagingManager } from "@/hooks/admin/usePackagingManager";
import type { Embalagem } from "@/types";
import { PackagingFormDialog } from "./PackagingFormDialog";
import { PackagingTable } from "./PackagingTable";

export function PackagingManager({ packages }: { packages: Embalagem[] }) {
  const manager = usePackagingManager();
  return (
    <>
      <div className="flex justify-end">
        <Button onClick={manager.openNew}>
          <Plus className="h-4 w-4" />
          Novo modelo
        </Button>
      </div>
      <PackagingTable
        packages={packages}
        onEdit={manager.openEdit}
        onRemove={(packaging) => void manager.remove(packaging)}
      />
      <PackagingFormDialog manager={manager} />
    </>
  );
}
