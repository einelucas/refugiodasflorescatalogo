"use client";

import { ShoppingCart } from "@phosphor-icons/react";
import { useCarrinho } from "./CarrinhoContext";

export function CarrinhoBotao() {
  const { totalItens, abrirCarrinho } = useCarrinho();

  return (
    <button
      type="button"
      className="site-header-cart"
      onClick={abrirCarrinho}
      aria-label={totalItens > 0 ? `Ver carrinho, ${totalItens} item(ns)` : "Ver carrinho"}
    >
      <ShoppingCart size={21} weight="bold" />
      {totalItens > 0 && (
        <span className="site-header-cart-badge" aria-hidden="true">
          {totalItens > 9 ? "9+" : totalItens}
        </span>
      )}
    </button>
  );
}
