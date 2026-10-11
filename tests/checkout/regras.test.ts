import assert from "node:assert/strict";
import { test } from "node:test";
import { chaveCotacaoCarrinho } from "@/lib/checkout/cotacao";
import { calcularSubtotal, resolverItensCarrinho } from "@/lib/checkout/itens";
import { calcularTotaisPedido } from "@/lib/checkout/totais";
import { checkoutValido, dadosClienteValidos, enderecoValido } from "@/lib/checkout/validacao";
import type { CategoriaCatalogo } from "@/types";
import { CLIENTE, ENDERECO, produto } from "./fixtures";

const centavos = (valor: number) => valor.toFixed(2);

test("totais: Pix não tem taxa; cartão aplica a taxa sobre produtos + frete", () => {
  const pix = calcularTotaisPedido({ subtotal: 309.79, frete: 23.47, formaPagamento: "pix", parcelas: 3 });
  assert.equal(centavos(pix.totalBase), "333.26");
  assert.equal(centavos(pix.totalFinal), "333.26");

  const esperado: Record<number, [string, string]> = {
    1: ["347.26", "347.26"], // 4,20%
    2: ["353.56", "176.78"], // 6,09%
    3: ["358.02", "119.34"], // 7,43%
  };
  for (const parcelas of [1, 2, 3]) {
    const cartao = calcularTotaisPedido({ subtotal: 309.79, frete: 23.47, formaPagamento: "credito", parcelas });
    assert.equal(centavos(cartao.totalFinal), esperado[parcelas][0], `total ${parcelas}x`);
    assert.equal(centavos(cartao.valorParcela), esperado[parcelas][1], `parcela ${parcelas}x`);
  }
});

test("itens: ignora produtos fora do catálogo e sob consulta soma zero", () => {
  const bella = produto("p1", "Bella", 89.9);
  const consulta = produto("p2", "Consulta", null);
  const categorias: CategoriaCatalogo[] = [
    { id: "c1", nome: "Buquês", slug: "buques", titulo: "Buquês", subtitulo: null, produtos: [bella, consulta] },
  ];

  const itens = resolverItensCarrinho(
    [
      { produtoId: "p1", quantidade: 3 },
      { produtoId: "removido", quantidade: 1 },
      { produtoId: "p2", quantidade: 2 },
    ],
    categorias,
  );

  assert.deepEqual(
    itens.map((i) => [i.produtoId, i.quantidade]),
    [["p1", 3], ["p2", 2]],
  );
  assert.equal(centavos(calcularSubtotal(itens)), "269.70");
});

test("validação: obrigatórios do comprador e do endereço", () => {
  assert.equal(dadosClienteValidos(CLIENTE), true);
  assert.equal(dadosClienteValidos({ nome: " A ", telefone: CLIENTE.telefone }), false);
  assert.equal(dadosClienteValidos({ nome: "Ana", telefone: "(67) 3421-000" }), false);
  assert.equal(dadosClienteValidos({ nome: "Ana", telefone: "(67) 3421-0000" }), true);

  assert.equal(enderecoValido(ENDERECO), true);
  assert.equal(enderecoValido({ ...ENDERECO, complemento: "" }), true, "complemento é opcional");
  for (const campo of ["rua", "numero", "bairro", "cidade"] as const) {
    assert.equal(enderecoValido({ ...ENDERECO, [campo]: "  " }), false, campo);
  }
  assert.equal(enderecoValido({ ...ENDERECO, cep: "79800-00" }), false);
  assert.equal(enderecoValido({ ...ENDERECO, estado: "M" }), false);

  assert.equal(checkoutValido({ cliente: CLIENTE, endereco: ENDERECO, quantidadeItens: 1 }), true);
  assert.equal(checkoutValido({ cliente: CLIENTE, endereco: ENDERECO, quantidadeItens: 0 }), false);
});

test("cotação: a chave muda com quantidade, remoção, CEP e entrega local", () => {
  const itens = [
    { produtoId: "p1", quantidade: 1 },
    { produtoId: "p2", quantidade: 2 },
  ];
  const base = chaveCotacaoCarrinho(itens, "79800-000", false);

  assert.equal(chaveCotacaoCarrinho(itens, "79800000", false), base, "máscara do CEP não importa");
  assert.notEqual(chaveCotacaoCarrinho([itens[0], { ...itens[1], quantidade: 3 }], "79800-000", false), base);
  assert.notEqual(chaveCotacaoCarrinho([itens[0]], "79800-000", false), base);
  assert.notEqual(chaveCotacaoCarrinho(itens, "79800-001", false), base);
  assert.notEqual(chaveCotacaoCarrinho(itens, "79800-000", true), base);
});
