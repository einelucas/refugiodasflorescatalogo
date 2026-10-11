import assert from "node:assert/strict";
import { test } from "node:test";
import { sanitizarHtmlInstitucional } from "@/lib/sanitizar-html";

test("remove scripts, eventos e URLs executáveis do HTML institucional", () => {
  const resultado = sanitizarHtmlInstitucional(
    '<p onclick="alert(1)">Texto<script>alert(2)</script></p>' +
      '<img src=x onerror="alert(3)">' +
      '<a href="javascript:alert(4)">link</a>',
  );

  assert.equal(resultado, "<p>Texto</p><a>link</a>");
});

test("preserva a formatação permitida e protege links em nova aba", () => {
  const resultado = sanitizarHtmlInstitucional(
    '<h2>Entrega</h2><p><strong>Prazo:</strong></p>' +
      '<ul><li>Consulte o CEP</li></ul>' +
      '<a href="https://example.com" target="_blank">detalhes</a>',
  );

  assert.equal(
    resultado,
    '<h2>Entrega</h2><p><strong>Prazo:</strong></p>' +
      '<ul><li>Consulte o CEP</li></ul>' +
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">detalhes</a>',
  );
});

test("bloqueia URLs relativas a protocolo sem remover links internos", () => {
  const resultado = sanitizarHtmlInstitucional(
    '<a href="//site-malicioso.example">externo</a><a href="/entregas">interno</a>',
  );

  assert.equal(resultado, '<a>externo</a><a href="/entregas">interno</a>');
});
