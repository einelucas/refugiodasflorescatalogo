/* =========================================================
   Decimal do Prisma não serializa em JSON e quebra
   silenciosamente se passado direto para a Frenet ou para o
   cliente. Centralizar a conversão aqui evita esquecer o
   Number() em alguma rota nova.
   ========================================================= */

type ComDecimais = Record<string, unknown>;

const CAMPOS_DECIMAIS = [
  "preco",
  "pesoKg",
  "alturaCm",
  "larguraCm",
  "comprimentoCm",
  "valorDeclarado",
  "pesoTaraKg",
] as const;

export function serializar<T extends ComDecimais>(obj: T): T {
  const saida: ComDecimais = { ...obj };
  for (const campo of CAMPOS_DECIMAIS) {
    const v = saida[campo];
    if (v == null) continue;
    if (typeof v === "object" && v !== null && "toNumber" in v) {
      saida[campo] = (v as { toNumber(): number }).toNumber();
    } else if (typeof v === "string") {
      saida[campo] = Number(v);
    }
  }
  return saida as T;
}

export function serializarLista<T extends ComDecimais>(lista: T[]): T[] {
  return lista.map(serializar);
}
