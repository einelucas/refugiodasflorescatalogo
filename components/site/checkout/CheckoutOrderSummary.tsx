import { formatarBRL } from "@/lib/utils";
import type { FormaPagamento, TotaisPedido } from "@/types";

type CheckoutOrderSummaryProps = {
  subtotal: number;
  shipping: number;
  paymentMethod: FormaPagamento;
  installments: number;
  totals: TotaisPedido;
};

/// Resumo do checkout. Mesmo visual do ProductOrderSummary do modal,
/// mais a linha de parcelamento e o total por forma de pagamento.
export function CheckoutOrderSummary({
  subtotal,
  shipping,
  paymentMethod,
  installments,
  totals,
}: CheckoutOrderSummaryProps) {
  return (
    <div className="resumo-pedido">
      <div className="resumo-linha">
        <span className="resumo-rotulo">Produtos</span>
        <span className="resumo-valor">{formatarBRL(subtotal)}</span>
      </div>
      <div className="resumo-linha">
        <span className="resumo-rotulo">Entrega</span>
        <span className="resumo-valor">{formatarBRL(shipping)}</span>
      </div>
      {paymentMethod === "credito" && (
        <div className="resumo-linha">
          <span className="resumo-rotulo">Pagamento</span>
          <span className="resumo-valor">
            {installments}x de {formatarBRL(totals.valorParcela)}
          </span>
        </div>
      )}
      <div className="resumo-linha resumo-total">
        <span>Total {paymentMethod === "credito" ? "no cartão" : "no Pix"}</span>
        <span>{formatarBRL(totals.totalFinal)}</span>
      </div>
    </div>
  );
}
