"use client";

import { AdminCrudDialog } from "@/components/admin/shared/AdminCrudDialog";
import { AdminFormActions } from "@/components/admin/shared/AdminFormActions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { CategoryManagerState } from "@/hooks/admin/useCategoryManager";
import { updateCategoryName } from "@/lib/admin/categorias/formulario";

export function CategoryFormDialog({ manager }: { manager: CategoryManagerState }) {
  const form = manager.form;
  return (
    <AdminCrudDialog
      open={manager.open}
      onOpenChange={manager.setOpen}
      title={form.id ? "Editar categoria" : "Nova categoria"}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Nome</Label>
          <Input
            value={form.nome}
            onChange={(event) =>
              manager.setForm((current) => updateCategoryName(current, event.target.value))
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label>Endereço (slug)</Label>
          <Input
            value={form.slug}
            onChange={(event) =>
              manager.setForm((current) => ({ ...current, slug: event.target.value }))
            }
          />
          {form.id && (
            <p className="text-xs text-muted-foreground">
              Mudar isto quebra links já compartilhados.
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Título exibido</Label>
          <Input
            value={form.titulo}
            onChange={(event) =>
              manager.setForm((current) => ({ ...current, titulo: event.target.value }))
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label>Subtítulo</Label>
          <Input
            value={form.subtitulo ?? ""}
            onChange={(event) =>
              manager.setForm((current) => ({ ...current, subtitulo: event.target.value }))
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label>Ordem</Label>
          <Input
            type="number"
            min={0}
            value={form.ordem}
            onChange={(event) =>
              manager.setForm((current) => ({ ...current, ordem: Number(event.target.value) }))
            }
          />
        </div>
        <label className="flex items-center gap-3">
          <Switch
            checked={form.ativa}
            onCheckedChange={(value) =>
              manager.setForm((current) => ({ ...current, ativa: value }))
            }
          />
          <span className="text-sm">Visível no site</span>
        </label>
        <AdminFormActions
          saving={manager.saving}
          onCancel={manager.close}
          onSave={() => void manager.save()}
        />
      </div>
    </AdminCrudDialog>
  );
}
