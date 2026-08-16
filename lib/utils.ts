import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatarBRL(valor: number | null): string {
  if (valor === null) return "A consultar";
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Preço à vista (Pix) é o valor cheio; no cartão embutimos a taxa da
// maquininha, que varia por número de parcelas — inclusive em 1x, que
// já cobra taxa (só o Pix é isento).
export const TAXAS_PARCELAMENTO: Record<number, number> = {
  1: 0.042,
  2: 0.0609,
  3: 0.0743,
};

export const PARCELAS_MAXIMAS = 3;

export function calcularValorCredito(valor: number, parcelas: number): number {
  const taxa = TAXAS_PARCELAMENTO[parcelas] ?? 0;
  return valor * (1 + taxa);
}

export function calcularParcela(valor: number, parcelas: number): number {
  return calcularValorCredito(valor, parcelas) / parcelas;
}

export function formatarParcelamento(valor: number): string {
  return `ou ${PARCELAS_MAXIMAS}x de ${formatarBRL(calcularParcela(valor, PARCELAS_MAXIMAS))}`;
}

export function mascararCEP(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function mascararTelefone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
