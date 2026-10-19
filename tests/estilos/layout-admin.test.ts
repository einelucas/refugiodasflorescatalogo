import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { NAV_ADMIN } from "@/components/admin/layout/navegacao";

function arquivo(relativo: string) {
  return readFileSync(path.join(process.cwd(), relativo), "utf8");
}

test("a navegação é única e expõe todas as abas no mesmo componente", () => {
  const shell = arquivo("components/admin/AdminShell.tsx");
  const tabs = arquivo("components/admin/layout/AdminTabsNav.tsx");
  assert.match(shell, /<AdminHeader pathname=\{pathname\}/);
  assert.match(shell, /<AdminTabsNav pathname=\{pathname\}/);
  assert.match(shell, /<AdminSearchProvider key=\{pathname\}>/);
  assert.match(tabs, /NAV_ADMIN\.map/);
  assert.equal(NAV_ADMIN.length, 8);
});

test("o header possui marca, busca contextual, catálogo e logout", () => {
  const header = arquivo("components/admin/layout/AdminHeader.tsx");
  assert.match(header, /<AdminLogo/);
  assert.match(header, /AdminSearchField/);
  assert.match(header, /URL_CATALOGO/);
  assert.match(header, /<SairButton/);
  assert.match(header, /podeBuscar/);
});

test("no mobile a barra de abas é substituída pela sidebar", () => {
  const shell = arquivo("components/admin/AdminShell.tsx");
  const tabs = arquivo("components/admin/layout/AdminTabsNav.tsx");
  const sidebar = arquivo("components/admin/layout/AdminMobileSidebar.tsx");
  const header = arquivo("components/admin/layout/AdminHeader.tsx");

  assert.match(shell, /<AdminMobileSidebar/);
  assert.match(header, /onAbrirMenu/);
  assert.match(header, /aria-controls=\{ID_MENU_MOBILE\}/);
  assert.match(header, /md:hidden/);
  assert.match(tabs, /hidden[^"]*md:block/);
  assert.match(sidebar, /md:hidden/);
  assert.match(sidebar, /NAV_ADMIN\.map/);
});

test("a busca é usada nas listas das abas administrativas", () => {
  [
    "components/admin/produtos/ProductList.tsx",
    "components/admin/categorias/CategoryManager.tsx",
    "components/admin/paginas/PageManager.tsx",
    "components/admin/embalagens/PackagingManager.tsx",
    "components/admin/gestao/GestaoPainel.tsx",
  ].forEach((file) => assert.match(arquivo(file), /useAdminSearch/));
});
