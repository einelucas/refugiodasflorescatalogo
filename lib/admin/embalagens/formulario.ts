import type { Embalagem } from "@/types";

export function createEmptyPackaging(): Embalagem {
  return {
    id: "",
    nome: "",
    alturaCm: 0,
    larguraCm: 0,
    comprimentoCm: 0,
    pesoTaraKg: 0,
  };
}

export function createPackagingPayload(packaging: Embalagem) {
  return {
    nome: packaging.nome,
    alturaCm: packaging.alturaCm,
    larguraCm: packaging.larguraCm,
    comprimentoCm: packaging.comprimentoCm,
    pesoTaraKg: packaging.pesoTaraKg,
  };
}

export function numericPackagingField(value: string): number {
  return Number(value);
}
