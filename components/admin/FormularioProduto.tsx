"use client";

import type { CategoriaOpcao, Embalagem, ProdutoForm } from "@/types";
import { ProductForm } from "./produto/ProductForm";

export function FormularioProduto({
  categorias,
  embalagens,
  inicial,
}: {
  categorias: CategoriaOpcao[];
  embalagens: Embalagem[];
  inicial?: ProdutoForm;
}) {
  return (
    <ProductForm
      categories={categorias}
      packages={embalagens}
      initialProduct={inicial}
    />
  );
}
