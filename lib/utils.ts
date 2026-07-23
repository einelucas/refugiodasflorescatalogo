import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatarBRL(valor: number | null): string {
  if (valor === null) return "A consultar";
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function mascararCEP(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}
