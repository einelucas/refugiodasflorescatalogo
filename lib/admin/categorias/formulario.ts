import { gerarSlug } from "@/lib/slug";
import type { CategoriaAdmin } from "@/types";

export type CategoryForm = Omit<CategoriaAdmin, "totalProdutos">;

export function createEmptyCategory(): CategoryForm {
  return {
    id: "",
    nome: "",
    slug: "",
    titulo: "",
    subtitulo: "",
    aliases: [],
    iconeUrl: "",
    ordem: 0,
    ativa: true,
  };
}

export function categoryToForm(category: CategoriaAdmin): CategoryForm {
  return {
    id: category.id,
    nome: category.nome,
    slug: category.slug,
    titulo: category.titulo,
    subtitulo: category.subtitulo ?? "",
    aliases: category.aliases,
    iconeUrl: category.iconeUrl ?? "",
    ordem: category.ordem,
    ativa: category.ativa,
  };
}

export function updateCategoryName(form: CategoryForm, name: string): CategoryForm {
  return {
    ...form,
    nome: name,
    slug: form.id ? form.slug : gerarSlug(name),
    titulo: form.titulo || name,
  };
}

export function createCategoryPayload(form: CategoryForm) {
  return {
    nome: form.nome,
    slug: form.slug || gerarSlug(form.nome),
    titulo: form.titulo || form.nome,
    subtitulo: form.subtitulo || null,
    aliases: form.aliases,
    iconeUrl: form.iconeUrl || null,
    ordem: form.ordem,
    ativa: form.ativa,
  };
}
