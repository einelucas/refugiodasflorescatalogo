"use client";

import type { CategoriaCatalogo, ProdutoCatalogo } from "@/types";
import { CategoryHeader } from "./CategoryHeader";
import { ProductCard } from "./ProductCard";

type CategorySectionProps = {
  category: CategoriaCatalogo;
  expandedProductId: string | null;
  onToggleProduct: (product: ProdutoCatalogo) => void;
  onOpenProduct: (product: ProdutoCatalogo) => void;
  onBuyProduct: (product: ProdutoCatalogo) => void;
  onAddProductToCart: (product: ProdutoCatalogo) => void;
};

export function CategorySection({
  category,
  expandedProductId,
  onToggleProduct,
  onOpenProduct,
  onBuyProduct,
  onAddProductToCart,
}: CategorySectionProps) {
  return (
    <section className="category-section">
      <CategoryHeader title={category.titulo} subtitle={category.subtitulo} />
      <div className="products-grid">
        {category.produtos.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            category={category.nome}
            expanded={expandedProductId === product.id}
            onToggle={() => onToggleProduct(product)}
            onOpen={() => onOpenProduct(product)}
            onBuy={() => onBuyProduct(product)}
            onAddToCart={() => onAddProductToCart(product)}
          />
        ))}
      </div>
    </section>
  );
}
