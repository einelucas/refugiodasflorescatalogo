"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useProductShipping } from "@/hooks/site/useProductShipping";
import type { ProdutoCatalogo } from "@/types";
import { useCarrinho } from "../CarrinhoContext";
import { ProductBadge } from "../catalogo/ProductBadge";
import { ProductImageCarousel } from "../catalogo/ProductImageCarousel";
import { ProductPrice } from "../catalogo/ProductPrice";
import { ShippingCalculator } from "../frete/ShippingCalculator";
import { ProductOrderSummary } from "./ProductOrderSummary";
import { ProductPurchaseActions } from "./ProductPurchaseActions";
import { ProductQuantitySelector } from "./ProductQuantitySelector";

type ProductDetailContentProps = {
  product: ProdutoCatalogo;
  category: string;
  whatsapp: string;
  onClose: () => void;
};

export function ProductDetailContent({
  product,
  category,
  whatsapp,
  onClose,
}: ProductDetailContentProps) {
  const [quantity, setQuantity] = useState(1);
  const { adicionar, abrirCarrinho } = useCarrinho();
  const shipping = useProductShipping(product.id, quantity);
  const subtotal = (product.preco ?? 0) * quantity;

  function changeQuantity(nextQuantity: number) {
    setQuantity(nextQuantity);
    shipping.invalidarCotacao();
  }

  function addToCart() {
    adicionar(product.id, quantity);
    toast.success(`${product.nome} adicionado ao carrinho!`, {
      action: { label: "Ver carrinho", onClick: () => abrirCarrinho() },
    });
    onClose();
  }

  function buyNow() {
    adicionar(product.id, quantity);
    onClose();
    abrirCarrinho();
  }

  return (
    <div className="product-detail">
      <ProductImageCarousel images={product.imagens} variant="modal">
        <ProductBadge badge={product.badge} variant="modal" />
      </ProductImageCarousel>

      <div className="modal-info checkout-form">
        <div>
          <p className="modal-category">{category}</p>
          <h2 className="modal-name">{product.nome}</h2>
          {product.descricao && <p className="modal-desc">{product.descricao}</p>}
          <ProductPrice price={product.preco} onRequest={product.sobConsulta} variant="modal" />
        </div>

        {!product.sobConsulta && (
          <ProductQuantitySelector value={quantity} onChange={changeQuantity} />
        )}

        {product.freteHabilitado && !product.sobConsulta && (
          <ShippingCalculator
            cep={shipping.cep}
            loading={shipping.calculando}
            error={shipping.erroFrete}
            localDelivery={shipping.freteLocal}
            options={shipping.opcoes}
            selectedOption={shipping.escolhida}
            onCepChange={shipping.alterarCep}
            onCalculate={() => void shipping.calcularFrete()}
            onSelectOption={shipping.selecionarOpcao}
          >
            {shipping.escolhida && (
              <ProductOrderSummary
                subtotal={subtotal}
                shipping={shipping.escolhida.preco}
              />
            )}
          </ShippingCalculator>
        )}

        {(product.sobConsulta || !product.freteHabilitado) && (
          <p className="product-notice">
            {product.sobConsulta
              ? "Este produto é feito sob encomenda. Fale conosco para combinar valor e prazo."
              : "A entrega deste item é combinada diretamente pelo WhatsApp."}
          </p>
        )}

        <ProductPurchaseActions
          product={product}
          quantity={quantity}
          whatsapp={whatsapp}
          cep={shipping.cep}
          selectedShipping={shipping.escolhida}
          onBuy={buyNow}
          onAddToCart={addToCart}
        />
      </div>
    </div>
  );
}
