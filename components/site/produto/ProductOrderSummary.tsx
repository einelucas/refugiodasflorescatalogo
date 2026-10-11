import { formatarBRL } from "@/lib/utils";

type ProductOrderSummaryProps = {
  subtotal: number;
  shipping: number;
};

export function ProductOrderSummary({ subtotal, shipping }: ProductOrderSummaryProps) {
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
      <div className="resumo-linha resumo-total">
        <span>Total</span>
        <span>{formatarBRL(subtotal + shipping)}</span>
      </div>
    </div>
  );
}
