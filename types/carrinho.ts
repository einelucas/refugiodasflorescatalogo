import type { ProdutoCatalogo } from "./produto";

/// Item salvo no carrinho (e no localStorage): só id e quantidade.
export type ItemCarrinho = { produtoId: string; quantidade: number };

/// Item do carrinho com o produto encontrado no catálogo atual.
export type ItemCarrinhoResolvido = ItemCarrinho & { produto: ProdutoCatalogo };

export type FormaPagamento = "pix" | "credito";
