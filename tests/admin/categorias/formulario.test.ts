import assert from "node:assert/strict";
import { test } from "node:test";
import {
  categoryToForm,
  createCategoryPayload,
  createEmptyCategory,
  updateCategoryName,
} from "@/lib/admin/categorias/formulario";
import { categoriaSchema } from "@/lib/validacao";

test("categoria nova nasce ativa e acompanha nome no slug e título", () => {
  const form = updateCategoryName(createEmptyCategory(), "Presentes Especiais");
  assert.equal(form.slug, "presentes-especiais");
  assert.equal(form.titulo, "Presentes Especiais");
  assert.equal(form.ativa, true);
});

test("edição preserva slug e título existentes ao alterar o nome", () => {
  const form = categoryToForm({
    id: "categoria-1",
    nome: "Buquês",
    slug: "buques",
    titulo: "Nossos buquês",
    subtitulo: null,
    aliases: ["flores"],
    iconeUrl: null,
    ordem: 2,
    ativa: false,
    totalProdutos: 3,
  });
  const changed = updateCategoryName(form, "Buquês especiais");
  assert.equal(changed.slug, "buques");
  assert.equal(changed.titulo, "Nossos buquês");
  assert.equal(changed.ativa, false);
});

test("payload de categoria preserva contrato e normaliza opcionais", () => {
  const payload = createCategoryPayload({
    ...createEmptyCategory(),
    nome: "Arranjos",
    subtitulo: "",
    iconeUrl: "",
  });
  assert.deepEqual(payload, {
    nome: "Arranjos",
    slug: "arranjos",
    titulo: "Arranjos",
    subtitulo: null,
    aliases: [],
    iconeUrl: null,
    ordem: 0,
    ativa: true,
  });
  assert.equal(categoriaSchema.safeParse(payload).success, true);
  assert.equal(categoriaSchema.safeParse({ ...payload, slug: "Slug Inválido" }).success, false);
});
