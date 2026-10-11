import { gerarSlug } from "@/lib/slug";
import type { Pagina } from "@/types";

export function createEmptyPage(): Pagina {
  return {
    id: "",
    slug: "",
    titulo: "",
    conteudoHtml: "",
    visivelNoMenu: true,
    ordem: 0,
  };
}

export function updatePageTitle(page: Pagina, title: string): Pagina {
  return {
    ...page,
    titulo: title,
    slug: page.id ? page.slug : gerarSlug(title),
  };
}

export function createPagePayload(page: Pagina) {
  return {
    slug: page.slug || gerarSlug(page.titulo),
    titulo: page.titulo,
    conteudoHtml: page.conteudoHtml || null,
    visivelNoMenu: page.visivelNoMenu,
    ordem: page.ordem,
  };
}
