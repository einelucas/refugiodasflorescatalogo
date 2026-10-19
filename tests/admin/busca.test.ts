import assert from "node:assert/strict";
import { test } from "node:test";
import { correspondeBusca, normalizarBusca } from "@/lib/admin/busca";

test("busca ignora acentos, caixa e espaços", () => {
  assert.equal(normalizarBusca("  PRÔDUÇÃO  "), "producao");
  assert.equal(correspondeBusca("BUQUE", "Buquê Bella"), true);
  assert.equal(correspondeBusca("  FLOR ", "Flor de maio"), true);
  assert.equal(correspondeBusca("rosa", "Girassol"), false);
});

test("busca filtra por múltiplos campos, inclusive números", () => {
  assert.equal(correspondeBusca("3.5", "Caixa M", 3.5), true);
  assert.equal(correspondeBusca("", "qualquer registro"), true);
  assert.equal(correspondeBusca("entrega", "Sobre", "Entregas e Frete"), true);
});
