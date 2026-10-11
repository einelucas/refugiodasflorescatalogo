"use client";

import { ShoppingBag, ShoppingCart } from "@phosphor-icons/react";
import { toast } from "sonner";
import { formatarBRL, mascararCEP } from "@/lib/utils";
import { montarLinkWhatsApp } from "@/lib/whatsapp";
import type { OpcaoFrete, ProdutoCatalogo } from "@/types";
import { WhatsAppIcon } from "../WhatsAppIcon";

type ProductPurchaseActionsProps = {
  product: ProdutoCatalogo;
  quantity: number;
  whatsapp: string;
  cep: string;
  selectedShipping: OpcaoFrete | null;
  onBuy: () => void;
  onAddToCart: () => void;
};

export function ProductPurchaseActions({
  product,
  quantity,
  whatsapp,
  cep,
  selectedShipping,
  onBuy,
  onAddToCart,
}: ProductPurchaseActionsProps) {
  const subtotal = (product.preco ?? 0) * quantity;

  function whatsappLink() {
    const lines = [`Olá! Tenho interesse em: ${product.nome}`];

    if (quantity > 1) lines.push(`Quantidade: ${quantity}`);
    if (!product.sobConsulta) lines.push(`Valor: ${formatarBRL(subtotal)}`);

    if (selectedShipping) {
      lines.push(
        `Entrega: ${selectedShipping.transportadora} ${selectedShipping.servico} — ${formatarBRL(selectedShipping.preco)}` +
          (selectedShipping.prazoDias != null
            ? ` (${selectedShipping.prazoDias} dia(s))`
            : ""),
      );
      lines.push(`CEP: ${mascararCEP(cep)}`);
      if (!product.sobConsulta) {
        lines.push(`Total com frete: ${formatarBRL(subtotal + selectedShipping.preco)}`);
      }
    }

    return montarLinkWhatsApp(whatsapp, lines.join("\n"));
  }

  if (product.sobConsulta) {
    return (
      <a
        className="btn-whatsapp-modal"
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => toast.success("Abrindo o WhatsApp em outra aba…")}
      >
        <WhatsAppIcon />
        Pedir pelo WhatsApp
      </a>
    );
  }

  return (
    <>
      <button type="button" className="btn-comprar-modal" onClick={onBuy}>
        <ShoppingBag weight="bold" aria-hidden="true" />
        Comprar
      </button>
      <button type="button" className="btn-add-carrinho-modal" onClick={onAddToCart}>
        <ShoppingCart weight="bold" aria-hidden="true" />
        Adicionar ao carrinho
      </button>
    </>
  );
}
