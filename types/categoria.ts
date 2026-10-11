import type { ProdutoCatalogo } from "./produto";

export type { CategoriaInput } from "@/lib/validacao";

/// Categoria do catálogo público, já com os produtos ativos.
export type CategoriaCatalogo = {
  id: string;
  nome: string;
  slug: string;
  titulo: string;
  subtitulo: string | null;
  produtos: ProdutoCatalogo[];
};

/// Linha da tela de categorias do painel.
export type CategoriaAdmin = {
  id: string;
  nome: string;
  slug: string;
  titulo: string;
  subtitulo: string | null;
  aliases: string[];
  iconeUrl: string | null;
  ordem: number;
  ativa: boolean;
  totalProdutos: number;
};

/// Opção de categoria nos selects do painel.
export type CategoriaOpcao = { id: string; nome: string };
