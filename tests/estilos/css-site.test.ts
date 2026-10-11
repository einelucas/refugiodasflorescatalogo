/* =========================================================
   Contratos estáticos entre o CSS do site (styles/site) e o
   JSX: imports, ordem, classes, variáveis, keyframes e URLs.
   ========================================================= */

import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

const RAIZ = process.cwd();
const DIR = path.join(RAIZ, "styles/site");
const ler = (p: string) => readFileSync(path.join(RAIZ, p), "utf8");
const semComentarios = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

const ordem = [...ler("styles/site/index.css").matchAll(/@import "\.\/([^"]+)";/g)].map((m) => m[1]);
const css = semComentarios(ordem.map((arquivo) => ler(`styles/site/${arquivo}`)).join("\n"));
const seletores = new Set([...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]));

function arquivosTsx(dir: string): string[] {
  return readdirSync(path.join(RAIZ, dir), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? arquivosTsx(path.join(dir, e.name))
      : e.name.endsWith(".tsx")
        ? [path.join(dir, e.name)]
        : [],
  );
}

test("index.css importa todos os arquivos de styles/site, uma vez cada", () => {
  const existentes = readdirSync(DIR).filter((f) => f.endsWith(".css") && f !== "index.css");
  assert.deepEqual([...ordem].sort(), existentes.sort());
  assert.equal(new Set(ordem).size, ordem.length);
});

test("camadas de sobrescrita continuam depois do que sobrescrevem", () => {
  const pos = (f: string) => ordem.indexOf(f);
  assert.equal(ordem[0], "tokens.css");
  assert.equal(ordem.at(-1), "responsive.css");
  assert.ok(pos("catalog-overrides.css") > pos("product-modal.css"));
  assert.ok(pos("next-adaptation.css") > pos("cart.css"));
  assert.ok(pos("next-adaptation.css") > pos("footer.css"));
  assert.ok(pos("responsive.css") > pos("next-adaptation.css"));
});

test("layout raiz carrega o Tailwind (globals) antes do CSS do site", () => {
  const layout = ler("app/layout.tsx");
  const globals = layout.indexOf('import "./globals.css"');
  const site = layout.indexOf('import "@/styles/site/index.css"');
  assert.ok(globals >= 0 && site > globals);
});

test("todas as regras do site ficam no escopo .public-site", () => {
  // Prelúdios de @media/@keyframes não são seletores: descarta os blocos
  // logo depois de um "@".
  const blocos = [...css.matchAll(/([^{}@;]+)\{/g)]
    .filter((m) => css[(m.index ?? 0) - 1] !== "@")
    .map((m) => m[1].trim());
  const fora = blocos.filter(
    (s) => s && !/^(from|to|\d+%)$/.test(s) && !s.split(",").every((p) => p.trim().startsWith(".public-site")),
  );
  assert.deepEqual(fora, []);
});

test("classes estáticas do JSX público têm regra no CSS", () => {
  const SEM_ESTILO = new Set(["cart-drawer-content"]); // gancho sem regra desde o original
  const arquivos = [
    ...arquivosTsx("components/site"),
    ...arquivosTsx("app/(site)"),
    ...arquivosTsx("app/p"),
  ];
  const faltando: string[] = [];
  for (const arquivo of arquivos) {
    const fonte = ler(arquivo);
    for (const m of fonte.matchAll(/className=(\{`[^`]*`\}|"[^"]*"|\{[^}]*\})/g)) {
      for (const lit of m[1].matchAll(/"([^"]*)"|`([^`]*)`/g)) {
        const texto = (lit[1] ?? lit[2]).replace(/\$\{[^}]*\}/g, " ");
        for (const classe of texto.split(/\s+/)) {
          if (/^[a-zA-Z][\w-]*$/.test(classe) && !seletores.has(classe) && !SEM_ESTILO.has(classe)) {
            faltando.push(`${classe} (${arquivo})`);
          }
        }
      }
    }
  }
  assert.deepEqual(faltando, []);
});

test("classes de estado aplicadas dinamicamente existem no CSS", () => {
  for (const classe of [
    "open", "expanded", "active", "selecionada", "is-loading", "visible",
    "badge-mais-vendido", "badge-novo", "badge-promocao",
    "campo-status--loading", "campo-status--sucesso", "campo-status--erro",
  ]) {
    assert.ok(seletores.has(classe), classe);
  }
});

test("variáveis usadas estão declaradas e keyframes referenciados existem", () => {
  const declaradas = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
  // --font-sans e --font-serif vêm do next/font, aplicadas no <html>.
  for (const v of ["--font-sans", "--font-serif"]) declaradas.add(v);
  const usadas = new Set([...css.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]));
  assert.deepEqual([...usadas].filter((v) => !declaradas.has(v)), []);

  const keyframes = new Set([...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]));
  const animacoes = [...css.matchAll(/animation(?:-name)?\s*:\s*([^;}]+)/g)].flatMap((m) =>
    m[1].split(",").map((a) => a.trim().split(/\s+/).find((t) => keyframes.has(t) || /^[a-zA-Z]/.test(t))),
  );
  assert.deepEqual(
    animacoes.filter((nome) => nome && nome !== "none" && !keyframes.has(nome)),
    [],
  );
});

test("url() do CSS são absolutas e apontam para arquivos de public/", () => {
  const urls = [...css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map((m) => m[1]);
  for (const url of urls) {
    if (url.startsWith("data:")) continue;
    assert.ok(url.startsWith("/"), `url relativa: ${url}`);
    assert.ok(existsSync(path.join(RAIZ, "public", url)), `arquivo ausente: ${url}`);
  }
});
