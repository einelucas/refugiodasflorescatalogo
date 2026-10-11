"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCrudDialog } from "@/hooks/admin/useCrudDialog";
import {
  createEmptyPackaging,
  createPackagingPayload,
} from "@/lib/admin/embalagens/formulario";
import { deleteAdminResource, saveAdminResource } from "@/lib/admin/requisicoes";
import type { Embalagem } from "@/types";

export function usePackagingManager() {
  const router = useRouter();
  const dialog = useCrudDialog<Embalagem>({ createEmpty: createEmptyPackaging });

  async function save() {
    dialog.setSaving(true);
    try {
      const result = await saveAdminResource(
        dialog.form.id
          ? `/api/admin/embalagens/${dialog.form.id}`
          : "/api/admin/embalagens",
        dialog.form.id ? "PATCH" : "POST",
        createPackagingPayload(dialog.form),
      );
      if (!result.ok) {
        toast.error(result.error ?? "Não foi possível salvar.");
        return;
      }
      toast.success("Embalagem salva.");
      dialog.close();
      router.refresh();
    } finally {
      dialog.setSaving(false);
    }
  }

  async function remove(packaging: Embalagem) {
    if (!confirm(`Apagar o modelo "${packaging.nome}"? Produtos já cadastrados não são afetados.`)) {
      return;
    }
    const result = await deleteAdminResource(`/api/admin/embalagens/${packaging.id}`);
    if (!result.ok) {
      toast.error("Não foi possível apagar.");
      return;
    }
    toast.success("Modelo apagado.");
    router.refresh();
  }

  return { ...dialog, save, remove };
}

export type PackagingManagerState = ReturnType<typeof usePackagingManager>;
