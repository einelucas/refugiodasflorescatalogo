"use client";

import { Button } from "@/components/ui/button";

export function AdminFormActions({
  saving,
  onCancel,
  onSave,
}: {
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button onClick={onSave} disabled={saving}>
        {saving ? "Salvando…" : "Salvar"}
      </Button>
    </div>
  );
}
