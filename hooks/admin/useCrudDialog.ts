"use client";

import { useState } from "react";

export function useCrudDialog<TForm, TEntity = TForm>({
  createEmpty,
  prepareEdit,
}: {
  createEmpty: () => TForm;
  prepareEdit?: (value: TEntity) => TForm;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TForm>(createEmpty);
  const [saving, setSaving] = useState(false);

  function openNew() {
    setForm(createEmpty());
    setOpen(true);
  }

  function openEdit(value: TEntity) {
    setForm(prepareEdit ? prepareEdit(value) : (value as unknown as TForm));
    setOpen(true);
  }

  return {
    open,
    setOpen,
    form,
    setForm,
    saving,
    setSaving,
    openNew,
    openEdit,
    close: () => setOpen(false),
  };
}
