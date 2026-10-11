"use client";

import { useEffect } from "react";
import { ShareNetwork, X } from "@phosphor-icons/react";
import { compartilharProduto } from "@/lib/client/compartilhar-produto";
import type { ProdutoCatalogo } from "@/types";
import { ProductDetailContent } from "./ProductDetailContent";

type ProductDetailModalProps = {
  product: ProdutoCatalogo;
  category: string;
  whatsapp: string;
  onClose: () => void;
};

export function ProductDetailModal({
  product,
  category,
  whatsapp,
  onClose,
}: ProductDetailModalProps) {
  useEffect(() => {
    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeWithEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeWithEscape);
    };
  }, [onClose]);

  return (
    <div className="modal-overlay open" role="presentation" onMouseDown={onClose}>
      <div
        className="modal-card checkout-card"
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes de ${product.nome}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="modal-share"
          onClick={() => void compartilharProduto(product)}
          aria-label="Compartilhar produto"
        >
          <ShareNetwork size={16} weight="bold" />
        </button>
        <button className="modal-close" onClick={onClose} aria-label="Fechar">
          <X size={16} weight="bold" />
        </button>
        <ProductDetailContent
          key={product.id}
          product={product}
          category={category}
          whatsapp={whatsapp}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
