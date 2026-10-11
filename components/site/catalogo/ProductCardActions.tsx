"use client";

import { ShoppingBag, ShoppingCart } from "@phosphor-icons/react";

type ProductCardActionsProps = {
  onRequest: boolean;
  onBuy: () => void;
  onAddToCart: () => void;
  onView: () => void;
};

export function ProductCardActions({
  onRequest,
  onBuy,
  onAddToCart,
  onView,
}: ProductCardActionsProps) {
  return (
    <div className="expand-buttons">
      {!onRequest && (
        <>
          <button
            className="btn-comprar"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onBuy();
            }}
          >
            <ShoppingBag className="btn-comprar-icon" weight="bold" aria-hidden="true" />
            Comprar
          </button>
          <button
            className="btn-add-carrinho"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onAddToCart();
            }}
          >
            <ShoppingCart weight="bold" aria-hidden="true" />
            Adicionar ao carrinho
          </button>
        </>
      )}
      <button
        className="btn-ver"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onView();
        }}
      >
        Ver Produto
      </button>
    </div>
  );
}
