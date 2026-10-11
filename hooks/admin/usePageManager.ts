"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCrudDialog } from "@/hooks/admin/useCrudDialog";
import { createEmptyPage, createPagePayload } from "@/lib/admin/paginas/formulario";
import { deleteAdminResource, saveAdminResource } from "@/lib/admin/requisicoes";
import type { Pagina } from "@/types";

export function usePageManager() {
  const router = useRouter();
  const dialog = useCrudDialog<Pagina>({ createEmpty: createEmptyPage });

  async function save() {
    dialog.setSaving(true);
    try {
      const result = await saveAdminResource(
        dialog.form.id ? `/api/admin/paginas/${dialog.form.id}` : "/api/admin/paginas",
        dialog.form.id ? "PATCH" : "POST",
        createPagePayload(dialog.form),
      );
      if (!result.ok) {
        toast.error(result.error ?? "Não foi possível salvar.");
        return;
      }
      toast.success("Página salva.");
      dialog.close();
      router.refresh();
    } finally {
      dialog.setSaving(false);
    }
  }

  async function remove(page: Pagina) {
    if (!confirm(`Apagar a página "${page.titulo}"?`)) return;
    const result = await deleteAdminResource(`/api/admin/paginas/${page.id}`);
    if (!result.ok) {
      toast.error("Não foi possível apagar.");
      return;
    }
    toast.success("Página apagada.");
    router.refresh();
  }

  return { ...dialog, save, remove };
}

export type PageManagerState = ReturnType<typeof usePageManager>;
