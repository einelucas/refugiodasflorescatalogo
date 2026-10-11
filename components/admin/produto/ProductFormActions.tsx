"use client";

import { Button } from "@/components/ui/button";

type ProductFormActionsProps = {
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
};

export function ProductFormActions({
  saving,
  onCancel,
  onSave,
}: ProductFormActionsProps) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button onClick={onSave} disabled={saving}>
        {saving ? "Salvando…" : "Salvar produto"}
      </Button>
    </div>
  );
}
