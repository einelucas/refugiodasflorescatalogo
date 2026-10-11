"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCrudDialog } from "@/hooks/admin/useCrudDialog";
import {
  categoryToForm,
  createCategoryPayload,
  createEmptyCategory,
  type CategoryForm,
} from "@/lib/admin/categorias/formulario";
import { deleteAdminResource, saveAdminResource } from "@/lib/admin/requisicoes";
import type { CategoriaAdmin } from "@/types";

export function useCategoryManager() {
  const router = useRouter();
  const dialog = useCrudDialog<CategoryForm, CategoriaAdmin>({
    createEmpty: createEmptyCategory,
    prepareEdit: categoryToForm,
  });

  async function save() {
    dialog.setSaving(true);
    try {
      const result = await saveAdminResource(
        dialog.form.id
          ? `/api/admin/categorias/${dialog.form.id}`
          : "/api/admin/categorias",
        dialog.form.id ? "PATCH" : "POST",
        createCategoryPayload(dialog.form),
      );
      if (!result.ok) {
        toast.error(result.error ?? "Não foi possível salvar.");
        return;
      }
      toast.success("Categoria salva.");
      dialog.close();
      router.refresh();
    } finally {
      dialog.setSaving(false);
    }
  }

  async function deactivate(category: CategoriaAdmin) {
    if (!confirm(`Desativar a categoria "${category.nome}"?`)) return;
    const result = await deleteAdminResource(
      `/api/admin/categorias/${category.id}`,
      fetch,
      true,
    );
    if (!result.ok) {
      toast.error(result.error ?? "Não foi possível desativar.");
      return;
    }
    toast.success("Categoria desativada.");
    router.refresh();
  }

  return { ...dialog, save, deactivate };
}

export type CategoryManagerState = ReturnType<typeof useCategoryManager>;
