export type { EmbalagemInput } from "@/lib/validacao";

/// Modelo de caixa com os Decimais do Prisma já convertidos.
export type Embalagem = {
  id: string;
  nome: string;
  alturaCm: number;
  larguraCm: number;
  comprimentoCm: number;
  pesoTaraKg: number;
};
