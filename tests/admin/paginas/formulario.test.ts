import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createEmptyPage,
  createPagePayload,
  updatePageTitle,
} from "@/lib/admin/paginas/formulario";
import { paginaSchema } from "@/lib/validacao";

test("página nova gera slug pelo título e inicia visível", () => {
  const page = updatePageTitle(createEmptyPage(), "Perguntas Frequentes");
  assert.equal(page.slug, "perguntas-frequentes");
  assert.equal(page.visivelNoMenu, true);
});

test("edição de página preserva URL ao alterar o título", () => {
  const page = updatePageTitle(
    { ...createEmptyPage(), id: "pagina-1", slug: "faq", titulo: "FAQ" },
    "Perguntas",
  );
  assert.equal(page.slug, "faq");
  assert.equal(page.titulo, "Perguntas");
});

test("payload preserva publicação e ordem e converte conteúdo vazio em nulo", () => {
  const payload = createPagePayload({
    ...createEmptyPage(),
    titulo: "Sobre nós",
    conteudoHtml: "",
    visivelNoMenu: false,
    ordem: 4,
  });
  assert.deepEqual(payload, {
    slug: "sobre-nos",
    titulo: "Sobre nós",
    conteudoHtml: null,
    visivelNoMenu: false,
    ordem: 4,
  });
  assert.equal(paginaSchema.safeParse(payload).success, true);
});
