"use client";

/* =========================================================
   Carrinho + checkout. Fica montado mesmo fechado: os dados
   digitados (comprador, endereço, frete) sobrevivem a
   fechar e reabrir o painel, como antes.
   ========================================================= */

import { useEffect, useMemo } from "react";
import { ShoppingCart, X } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useCartShipping } from "@/hooks/site/useCartShipping";
import { useCheckout } from "@/hooks/site/useCheckout";
import { calcularSubtotal, resolverItensCarrinho } from "@/lib/checkout/itens";
import { montarMensagemPedido } from "@/lib/checkout/montar-mensagem-pedido";
import { calcularTotaisPedido } from "@/lib/checkout/totais";
import { formatarBRL } from "@/lib/utils";
import { montarLinkWhatsApp } from "@/lib/whatsapp";
import type { CategoriaCatalogo } from "@/types";
import { useCarrinho } from "../CarrinhoContext";
import { CheckoutForm } from "../checkout/CheckoutForm";
import { CartEmptyState } from "./CartEmptyState";
import { CartItem } from "./CartItem";

type CartDrawerProps = {
  categorias: CategoriaCatalogo[];
  whatsapp: string;
};

export function CartDrawer({ categorias, whatsapp }: CartDrawerProps) {
  const { itens, aberto, fecharCarrinho, definirQuantidade, remover, limpar } = useCarrinho();

  const itensResolvidos = useMemo(
    () => resolverItensCarrinho(itens, categorias),
    [itens, categorias],
  );
  const subtotal = calcularSubtotal(itensResolvidos);

  const checkout = useCheckout(itensResolvidos.length);
  const frete = useCartShipping({
    itens: itensResolvidos,
    cep: checkout.endereco.cep,
    cidade: checkout.endereco.cidade,
    estado: checkout.endereco.estado,
  });

  const totais = calcularTotaisPedido({
    subtotal,
    frete: frete.escolhida?.preco ?? 0,
    formaPagamento: checkout.formaPagamento,
    parcelas: checkout.parcelas,
  });

  function alterarCep(valor: string) {
    checkout.alterarCep(valor);
    frete.invalidarCotacao();
  }

  function finalizarPedido() {
    if (!checkout.confirmarEnvio()) return;

    const mensagem = montarMensagemPedido({
      itens: itensResolvidos,
      subtotal,
      frete: frete.escolhida,
      freteLocal: frete.freteLocal,
      formaPagamento: checkout.formaPagamento,
      parcelas: checkout.parcelas,
      totais,
      endereco: checkout.endereco,
      cliente: checkout.cliente,
      observacoes: checkout.observacoes,
    });
    window.open(montarLinkWhatsApp(whatsapp, mensagem), "_blank", "noopener,noreferrer");
    toast.success("Pedido pronto! Confira a aba do WhatsApp que abriu.");
    limpar();
    fecharCarrinho();
  }

  useEffect(() => {
    if (!aberto) return;

    function fecharComEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") fecharCarrinho();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", fecharComEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", fecharComEscape);
    };
  }, [aberto, fecharCarrinho]);

  if (!aberto) return null;

  return (
    <div className="modal-overlay open" role="presentation" onMouseDown={() => fecharCarrinho()}>
      <div
        className="modal-card checkout-card"
        role="dialog"
        aria-modal="true"
        aria-label="Seu carrinho"
        onMouseDown={(evento) => evento.stopPropagation()}
      >
        <button className="modal-close" onClick={() => fecharCarrinho()} aria-label="Fechar">
          <X size={16} weight="bold" />
        </button>

        <div className="checkout-form cart-drawer-content">
          <h2 className="cart-drawer-title">
            <ShoppingCart weight="bold" aria-hidden="true" />
            Seu carrinho
          </h2>

          {itensResolvidos.length === 0 ? (
            <CartEmptyState />
          ) : (
            <>
              <div className="cart-item-list">
                {itensResolvidos.map((item) => (
                  <CartItem
                    key={item.produtoId}
                    item={item}
                    onChangeQuantity={(quantidade) => definirQuantidade(item.produtoId, quantidade)}
                    onRemove={() => remover(item.produtoId)}
                  />
                ))}
              </div>

              <div className="cart-subtotal">
                <span>Subtotal</span>
                <span>{formatarBRL(subtotal)}</span>
              </div>

              <CheckoutForm
                checkout={checkout}
                shipping={frete}
                subtotal={subtotal}
                totals={totais}
                onCepChange={alterarCep}
                onSubmit={finalizarPedido}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
