"use client";

import { QUANTIDADE_MAXIMA_ITEM } from "@/config/catalogo";

type ProductQuantitySelectorProps = {
  value: number;
  onChange: (value: number) => void;
};

export function ProductQuantitySelector({ value, onChange }: ProductQuantitySelectorProps) {
  function updateValue(nextValue: number) {
    onChange(Math.max(1, Math.min(QUANTIDADE_MAXIMA_ITEM, nextValue)));
  }

  return (
    <div className="quantity-row">
      <span>Quantidade</span>
      <div className="quantity-control">
        <button type="button" onClick={() => updateValue(value - 1)}>
          −
        </button>
        <strong>{value}</strong>
        <button type="button" onClick={() => updateValue(value + 1)}>
          +
        </button>
      </div>
    </div>
  );
}
