export type { PaginaInput } from "@/lib/validacao";

/// Página de conteúdo como o painel edita.
export type Pagina = {
  id: string;
  slug: string;
  titulo: string;
  conteudoHtml: string | null;
  visivelNoMenu: boolean;
  ordem: number;
};
