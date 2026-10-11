"use client";

import { Minus, Plus } from "@phosphor-icons/react";

type CartItemQuantityProps = {
  value: number;
  /// Recebe o valor sem limitar: o CarrinhoContext aplica o máximo e
  /// remove o item quando a quantidade chega a zero.
  onChange: (value: number) => void;
};

/// Controle compacto do carrinho. Não reaproveita ProductQuantitySelector
/// porque aqui o "−" em 1 remove o item, e o DOM é outro (ícones, sem
/// rótulo "Quantidade").
export function CartItemQuantity({ value, onChange }: CartItemQuantityProps) {
  return (
    <div className="quantity-control">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        aria-label="Diminuir quantidade"
      >
        <Minus size={12} weight="bold" />
      </button>
      <strong>{value}</strong>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label="Aumentar quantidade"
      >
        <Plus size={12} weight="bold" />
      </button>
    </div>
  );
}
