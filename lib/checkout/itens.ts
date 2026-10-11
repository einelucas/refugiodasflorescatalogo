import type { CategoriaCatalogo, ItemCarrinho, ItemCarrinhoResolvido } from "@/types";

/// Junta cada item salvo no carrinho ao produto do catálogo atual.
/// Ignora silenciosamente itens de produtos que saíram do catálogo
/// desde que foram adicionados (despublicados/removidos).
export function resolverItensCarrinho(
  itens: ItemCarrinho[],
  categorias: CategoriaCatalogo[],
): ItemCarrinhoResolvido[] {
  const produtos = new Map(
    categorias.flatMap((categoria) =>
      categoria.produtos.map((produto) => [produto.id, produto] as const),
    ),
  );

  return itens
    .map((item) => {
      const produto = produtos.get(item.produtoId);
      return produto ? { ...item, produto } : null;
    })
    .filter((item): item is ItemCarrinhoResolvido => item !== null);
}

/// Preço de uma linha do carrinho. Produto sem preço (sob consulta)
/// conta como zero.
export function calcularPrecoItem(item: ItemCarrinhoResolvido): number {
  return (item.produto.preco ?? 0) * item.quantidade;
}

export function calcularSubtotal(itens: ItemCarrinhoResolvido[]): number {
  return itens.reduce((soma, item) => soma + calcularPrecoItem(item), 0);
}
