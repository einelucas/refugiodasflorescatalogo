import { calcularParcela, calcularValorCredito } from "@/lib/utils";
import type { FormaPagamento, TotaisPedido } from "@/types";

/// Base sobre a qual a taxa do cartão incide: produtos + frete (quando
/// já escolhido) — é o valor que realmente vai passar na maquininha.
export function calcularTotaisPedido({
  subtotal,
  frete,
  formaPagamento,
  parcelas,
}: {
  subtotal: number;
  frete: number;
  formaPagamento: FormaPagamento;
  parcelas: number;
}): TotaisPedido {
  const totalBase = subtotal + frete;
  return {
    totalBase,
    totalFinal:
      formaPagamento === "credito" ? calcularValorCredito(totalBase, parcelas) : totalBase,
    valorParcela: calcularParcela(totalBase, parcelas),
  };
}
