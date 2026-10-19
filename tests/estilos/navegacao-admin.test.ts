import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { NAV_ADMIN, itemAtivo } from "@/components/admin/layout/navegacao";

test("links do painel na ordem esperada e com página existente", () => {
  assert.deepEqual(
    NAV_ADMIN.map((item) => [item.href, item.rotulo]),
    [
      ["/admin/produtos", "Produtos"],
      ["/admin/categorias", "Categorias"],
      ["/admin/paginas", "Páginas"],
      ["/admin/embalagens", "Embalagens"],
      ["/admin/estoque", "Estoque"],
      ["/admin/producao", "Produção"],
      ["/admin/financeiro", "Financeiro"],
      ["/admin/relatorios", "Relatórios"],
    ],
  );
  for (const { href } of NAV_ADMIN) {
    assert.ok(existsSync(path.join(process.cwd(), "app", href, "page.tsx")), href);
  }
});

test("item ativo na própria rota e nas sub-rotas, sem falso positivo por prefixo", () => {
  assert.equal(itemAtivo("/admin/produtos", "/admin/produtos"), true);
  assert.equal(itemAtivo("/admin/produtos/novo", "/admin/produtos"), true);
  assert.equal(itemAtivo("/admin/produtos/123", "/admin/produtos"), true);
  assert.equal(itemAtivo("/admin/produtos-antigos", "/admin/produtos"), false);
  assert.equal(itemAtivo("/admin/categorias", "/admin/produtos"), false);
});
