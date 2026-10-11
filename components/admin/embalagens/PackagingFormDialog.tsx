"use client";

import { AdminCrudDialog } from "@/components/admin/shared/AdminCrudDialog";
import { AdminFormActions } from "@/components/admin/shared/AdminFormActions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LIMITES } from "@/config/frete";
import type { PackagingManagerState } from "@/hooks/admin/usePackagingManager";
import { numericPackagingField } from "@/lib/admin/embalagens/formulario";
import type { Embalagem } from "@/types";

type NumericField = "alturaCm" | "larguraCm" | "comprimentoCm" | "pesoTaraKg";

export function PackagingFormDialog({ manager }: { manager: PackagingManagerState }) {
  const form = manager.form;
  function setNumber(field: NumericField, value: string) {
    manager.setForm((current) => ({
      ...current,
      [field]: numericPackagingField(value),
    } satisfies Embalagem));
  }

  return (
    <AdminCrudDialog
      open={manager.open}
      onOpenChange={manager.setOpen}
      title={form.id ? "Editar modelo" : "Novo modelo de caixa"}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Nome</Label>
          <Input
            placeholder="Caixa buquê médio"
            value={form.nome}
            onChange={(event) =>
              manager.setForm((current) => ({ ...current, nome: event.target.value }))
            }
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Altura (cm)</Label>
            <Input
              type="number"
              step="0.1"
              value={form.alturaCm || ""}
              onChange={(event) => setNumber("alturaCm", event.target.value)}
            />
            <p className="text-xs text-muted-foreground">mín. {LIMITES.alturaMin}</p>
          </div>
          <div className="space-y-1.5">
            <Label>Largura (cm)</Label>
            <Input
              type="number"
              step="0.1"
              value={form.larguraCm || ""}
              onChange={(event) => setNumber("larguraCm", event.target.value)}
            />
            <p className="text-xs text-muted-foreground">mín. {LIMITES.larguraMin}</p>
          </div>
          <div className="space-y-1.5">
            <Label>Comprimento (cm)</Label>
            <Input
              type="number"
              step="0.1"
              value={form.comprimentoCm || ""}
              onChange={(event) => setNumber("comprimentoCm", event.target.value)}
            />
            <p className="text-xs text-muted-foreground">mín. {LIMITES.comprimentoMin}</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Peso da caixa vazia (kg)</Label>
          <Input
            type="number"
            step="0.001"
            value={form.pesoTaraKg || ""}
            onChange={(event) => setNumber("pesoTaraKg", event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Só referência — o peso final é informado no produto.
          </p>
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
