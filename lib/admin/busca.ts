// Normalização compartilhada: maiúsculas e acentos não afetam os resultados.
export function normalizarBusca(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}

export function correspondeBusca(termo: string, ...campos: Array<string | number | boolean | null | undefined>) {
  const normalizado = normalizarBusca(termo);
  if (!normalizado) return true;
  return campos.some((campo) => normalizarBusca(String(campo ?? "")).includes(normalizado));
}
