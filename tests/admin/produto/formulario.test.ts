import assert from "node:assert/strict";
import { test } from "node:test";
import { LIMITES } from "@/config/frete";
import { TAMANHO_MAXIMO_IMAGEM, TIPOS_IMAGEM_ACEITOS } from "@/config/upload";
import {
  aplicarEmbalagemAoProduto,
  atualizarCampoProduto,
  campoInvalidaTesteFrete,
  criarPayloadProduto,
  criarPayloadTesteFrete,
  criarProdutoInicial,
  erroArquivoImagem,
  resumoDimensoes,
} from "@/lib/admin/produto/formulario";
import { EMBALAGEM, PRODUTO } from "./fixtures";

test("produto novo preserva os valores padrão e usa a primeira categoria", () => {
  const produto = criarProdutoInicial([
    { id: "categoria-1", nome: "Buquês" },
    { id: "categoria-2", nome: "Presentes" },
  ]);

  assert.equal(produto.categoriaId, "categoria-1");
  assert.equal(produto.ativo, false);
  assert.equal(produto.freteHabilitado, true);
  assert.equal(produto.medidasVerificadas, false);
  assert.equal(produto.preco, null);
  assert.deepEqual(produto.imagens, []);
});

test("alterar medidas invalida a conferência; outros campos preservam o estado", () => {
  const medida = atualizarCampoProduto(PRODUTO, "pesoKg", 1.5);
  assert.equal(medida.pesoKg, 1.5);
  assert.equal(medida.medidasVerificadas, false);

  const nome = atualizarCampoProduto(PRODUTO, "nome", "Buquê Novo");
  assert.equal(nome.nome, "Buquê Novo");
  assert.equal(nome.medidasVerificadas, true);
});

test("teste de frete é invalidado por medidas e valores que compõem a cotação", () => {
  for (const campo of [
    "pesoKg",
    "alturaCm",
    "larguraCm",
    "comprimentoCm",
    "preco",
    "valorDeclarado",
  ] as const) {
    assert.equal(campoInvalidaTesteFrete(campo), true, campo);
  }
  assert.equal(campoInvalidaTesteFrete("nome"), false);
  assert.equal(campoInvalidaTesteFrete("badge"), false);
});

test("aplicar embalagem copia somente dimensões e exige nova conferência", () => {
  const produto = aplicarEmbalagemAoProduto(PRODUTO, EMBALAGEM);
  assert.equal(produto.alturaCm, EMBALAGEM.alturaCm);
  assert.equal(produto.larguraCm, EMBALAGEM.larguraCm);
  assert.equal(produto.comprimentoCm, EMBALAGEM.comprimentoCm);
  assert.equal(produto.pesoKg, PRODUTO.pesoKg);
  assert.equal(produto.medidasVerificadas, false);
});

test("payload de edição preserva contrato, nulos e ordem das imagens", () => {
  const payload = criarPayloadProduto({
    ...PRODUTO,
    descricao: "",
    badge: "",
    valorDeclarado: 0,
  });

  assert.equal(payload.id, PRODUTO.id);
  assert.equal(payload.descricao, null);
  assert.equal(payload.badge, null);
  assert.equal(payload.valorDeclarado, null);
  assert.deepEqual(payload.imagens, [
    { url: "https://example.com/a.webp", alt: "Frente", ordem: 0 },
    { url: "https://example.com/b.webp", alt: null, ordem: 1 },
  ]);
});

test("produto sob consulta envia preço nulo sem alterar os demais campos", () => {
  const payload = criarPayloadProduto({ ...PRODUTO, sobConsulta: true, preco: 149.9 });
  assert.equal(payload.preco, null);
  assert.equal(payload.sobConsulta, true);
  assert.equal(payload.nome, PRODUTO.nome);
});

test("payload do teste de frete mantém dimensões e fallback do valor declarado", () => {
  const comPreco = criarPayloadTesteFrete(
    { ...PRODUTO, valorDeclarado: null, preco: 149.9 },
    "01001-000",
  );
  assert.equal(comPreco.valorDeclarado, 149.9);
  assert.equal(comPreco.quantidade, 1);
  assert.equal(comPreco.cepDestino, "01001-000");

  const fallback = criarPayloadTesteFrete(
    { ...PRODUTO, valorDeclarado: null, preco: null },
    "01001-000",
  );
  assert.equal(fallback.valorDeclarado, 100);
});

test("resumo de dimensões respeita exatamente o limite compartilhado", () => {
  const noLimite = resumoDimensoes({
    ...PRODUTO,
    alturaCm: 50,
    larguraCm: 50,
    comprimentoCm: LIMITES.somaMax - 100,
  });
  assert.equal(noLimite.soma, LIMITES.somaMax);
  assert.equal(noLimite.somaExcedida, false);

  const excedido = resumoDimensoes({ ...PRODUTO, comprimentoCm: LIMITES.somaMax });
  assert.equal(excedido.somaExcedida, true);
});

test("upload aceita os MIME configurados e rejeita tipo ou tamanho inválidos", () => {
  for (const type of TIPOS_IMAGEM_ACEITOS) {
    assert.equal(erroArquivoImagem({ type, size: TAMANHO_MAXIMO_IMAGEM }), null);
  }
  assert.equal(
    erroArquivoImagem({ type: "image/gif", size: 100 }),
    "Use uma imagem JPG, PNG, WebP ou AVIF.",
  );
  assert.equal(
    erroArquivoImagem({ type: "image/jpeg", size: TAMANHO_MAXIMO_IMAGEM + 1 }),
    "A imagem deve ter no máximo 6 MB.",
  );
});
