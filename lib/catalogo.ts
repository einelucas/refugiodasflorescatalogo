/* =========================================================
   Conversão dos dados do Prisma para o contrato do catálogo
   público (página inicial). Só servidor.
   ========================================================= */

import type { Categoria, Produto, ProdutoImagem } from "@prisma/client";
import type { CategoriaCatalogo, ProdutoCatalogo } from "@/types";

/// Caminhos relativos ("imagens/x.png") viram absolutos ("/imagens/x.png");
/// URLs externas e data: passam intactas.
export function normalizarUrlImagem(url: string) {
  if (/^(https?:)?\/\//i.test(url) || url.startsWith("data:")) return url;
  return url.startsWith("/") ? url : `/${url}`;
}

type ProdutoComImagens = Produto & { imagens: ProdutoImagem[] };
type CategoriaComProdutos = Categoria & { produtos: ProdutoComImagens[] };

export function serializarProdutoCatalogo(produto: ProdutoComImagens): ProdutoCatalogo {
  return {
    id: produto.id,
    nome: produto.nome,
    descricao: produto.descricao,
    preco: produto.preco === null ? null : Number(produto.preco),
    sobConsulta: produto.sobConsulta,
    badge: produto.badge,
    freteHabilitado: produto.freteHabilitado,
    imagens: produto.imagens.map((imagem) => ({
      url: normalizarUrlImagem(imagem.url),
      alt: imagem.alt ?? produto.nome,
    })),
  };
}

export function serializarCategoriaCatalogo(categoria: CategoriaComProdutos): CategoriaCatalogo {
  return {
    id: categoria.id,
    nome: categoria.nome,
    slug: categoria.slug,
    titulo: categoria.titulo,
    subtitulo: categoria.subtitulo,
    produtos: categoria.produtos.map(serializarProdutoCatalogo),
  };
}
