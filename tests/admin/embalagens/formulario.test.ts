import assert from "node:assert/strict";
import { test } from "node:test";
import { LIMITES } from "@/config/frete";
import {
  createEmptyPackaging,
  createPackagingPayload,
  numericPackagingField,
} from "@/lib/admin/embalagens/formulario";
import { embalagemSchema } from "@/lib/validacao";

test("campos numéricos mantêm a conversão usada pelos inputs", () => {
  assert.equal(numericPackagingField("12.5"), 12.5);
  assert.equal(numericPackagingField(""), 0);
});

test("payload de embalagem remove somente o id", () => {
  const packaging = {
    ...createEmptyPackaging(),
    id: "embalagem-1",
    nome: "Caixa média",
    alturaCm: 20,
    larguraCm: 30,
    comprimentoCm: 40,
    pesoTaraKg: 0.25,
  };
  assert.deepEqual(createPackagingPayload(packaging), {
    nome: "Caixa média",
    alturaCm: 20,
    larguraCm: 30,
    comprimentoCm: 40,
    pesoTaraKg: 0.25,
  });
});

test("schema compartilhado preserva mínimos, peso e soma das dimensões", () => {
  const valid = {
    nome: "Caixa limite",
    alturaCm: LIMITES.alturaMin,
    larguraCm: LIMITES.larguraMin,
    comprimentoCm: LIMITES.comprimentoMin,
    pesoTaraKg: 0,
  };
  assert.equal(embalagemSchema.safeParse(valid).success, true);
  assert.equal(
    embalagemSchema.safeParse({ ...valid, alturaCm: LIMITES.alturaMin - 0.1 }).success,
    false,
  );
  assert.equal(
    embalagemSchema.safeParse({ ...valid, alturaCm: 100, larguraCm: 100 }).success,
    false,
  );
  assert.equal(embalagemSchema.safeParse({ ...valid, pesoTaraKg: 5.1 }).success, false);
});
