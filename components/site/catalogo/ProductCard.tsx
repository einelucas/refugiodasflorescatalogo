"use client";

import type { ProdutoCatalogo } from "@/types";
import { ProductBadge } from "./ProductBadge";
import { ProductCardActions } from "./ProductCardActions";
import { ProductImageCarousel } from "./ProductImageCarousel";
import { ProductPrice } from "./ProductPrice";

type ProductCardProps = {
  product: ProdutoCatalogo;
  category: string;
  expanded: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onBuy: () => void;
  onAddToCart: () => void;
};

export function ProductCard({
  product,
  category,
  expanded,
  onToggle,
  onOpen,
  onBuy,
  onAddToCart,
}: ProductCardProps) {
  return (
    <article
      className={`product-card ${expanded ? "expanded" : ""}`}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle();
        }
      }}
      aria-label={product.nome}
    >
      <ProductImageCarousel images={product.imagens}>
        <ProductBadge badge={product.badge} />
      </ProductImageCarousel>

      <div className="card-body">
        <p className="card-category">{category}</p>
        <h3 className="card-name">{product.nome}</h3>
        <ProductPrice price={product.preco} onRequest={product.sobConsulta} />
        {product.descricao && <p className="card-desc">{product.descricao}</p>}
      </div>

      <div className="card-expand" aria-hidden={!expanded}>
        <p className="card-expand-note">Veja os detalhes ou compre agora mesmo.</p>
        <ProductCardActions
          onRequest={product.sobConsulta}
          onBuy={onBuy}
          onAddToCart={onAddToCart}
          onView={onOpen}
        />
      </div>
    </article>
  );
}
