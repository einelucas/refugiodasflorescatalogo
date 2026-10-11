"use client";

import Image from "next/image";
import { Trash } from "@phosphor-icons/react";
import { formatarBRL } from "@/lib/utils";
import type { ItemCarrinhoResolvido } from "@/types";
import { CartItemQuantity } from "./CartItemQuantity";

type CartItemProps = {
  item: ItemCarrinhoResolvido;
  onChangeQuantity: (quantidade: number) => void;
  onRemove: () => void;
};

export function CartItem({ item, onChangeQuantity, onRemove }: CartItemProps) {
  const imagem = item.produto.imagens[0];

  return (
    <div className="cart-item">
      <div className="cart-item-img">
        {imagem ? (
          <Image src={imagem.url} alt={imagem.alt} fill sizes="64px" />
        ) : (
          <div className="img-placeholder">🌸</div>
        )}
      </div>
      <div className="cart-item-info">
        <p className="cart-item-name">{item.produto.nome}</p>
        <p className="cart-item-price">{formatarBRL(item.produto.preco)}</p>
        <div className="cart-item-row">
          <CartItemQuantity value={item.quantidade} onChange={onChangeQuantity} />
          <button
            type="button"
            className="cart-item-remove"
            onClick={onRemove}
            aria-label={`Remover ${item.produto.nome} do carrinho`}
          >
            <Trash size={16} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}
