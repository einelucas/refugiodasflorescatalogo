"use client";

import { AdminCrudDialog } from "@/components/admin/shared/AdminCrudDialog";
import { AdminFormActions } from "@/components/admin/shared/AdminFormActions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { PageManagerState } from "@/hooks/admin/usePageManager";
import { updatePageTitle } from "@/lib/admin/paginas/formulario";

export function PageFormDialog({ manager }: { manager: PageManagerState }) {
  const form = manager.form;
  return (
    <AdminCrudDialog
      open={manager.open}
      onOpenChange={manager.setOpen}
      title={form.id ? "Editar página" : "Nova página"}
      contentClassName="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Título</Label>
          <Input
            value={form.titulo}
            onChange={(event) =>
              manager.setForm((current) => updatePageTitle(current, event.target.value))
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label>Endereço</Label>
          <Input
            value={form.slug}
            onChange={(event) =>
              manager.setForm((current) => ({ ...current, slug: event.target.value }))
            }
          />
          <p className="text-xs text-muted-foreground">
            A página ficará em /p/{form.slug || "…"}
          </p>
        </div>
        <div className="space-y-1.5">
          <Label>Conteúdo</Label>
          <Textarea
            rows={12}
            className="font-mono text-xs"
            placeholder="<p>Escreva aqui…</p>"
            value={form.conteudoHtml ?? ""}
            onChange={(event) =>
              manager.setForm((current) => ({ ...current, conteudoHtml: event.target.value }))
            }
          />
          <p className="text-xs text-muted-foreground">
            Aceita HTML simples: &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;a&gt;.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-3">
            <Switch
              checked={form.visivelNoMenu}
              onCheckedChange={(value) =>
                manager.setForm((current) => ({ ...current, visivelNoMenu: value }))
              }
            />
            <span className="text-sm">Mostrar no menu</span>
          </label>
          <div className="flex items-center gap-2">
            <Label className="text-sm">Ordem</Label>
            <Input
              type="number"
              min={0}
              className="w-20"
              value={form.ordem}
              onChange={(event) =>
                manager.setForm((current) => ({ ...current, ordem: Number(event.target.value) }))
              }
            />
          </div>
        </div>
        <AdminFormActions
          saving={manager.saving}
          onCancel={manager.close}
          onSave={() => void manager.save()}
        />
      </div>
    </AdminCrudDialog>
  );
}
