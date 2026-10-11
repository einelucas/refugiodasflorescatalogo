import assert from "node:assert/strict";
import { test } from "node:test";
import { calcularSubtotal } from "@/lib/checkout/itens";
import { montarMensagemPedido } from "@/lib/checkout/montar-mensagem-pedido";
import { calcularTotaisPedido } from "@/lib/checkout/totais";
import { CLIENTE, ENDERECO, PAC, brl, item, produto } from "./fixtures";

const bella = produto("p1", "Buquê Bella", 89.9);
const jardim = produto("p2", "Buquê Jardim", 129.99);

test("cartão em 3x com frete da Frenet e vários itens", () => {
  const itens = [item(bella, 2), item(jardim, 1)];
  const subtotal = calcularSubtotal(itens);
  const totais = calcularTotaisPedido({ subtotal, frete: PAC.preco, formaPagamento: "credito", parcelas: 3 });

  const mensagem = montarMensagemPedido({
    itens,
    subtotal,
    frete: PAC,
    freteLocal: false,
    formaPagamento: "credito",
    parcelas: 3,
    totais,
    endereco: { ...ENDERECO, cep: "01001000", cidade: "São Paulo", estado: "SP" },
    cliente: CLIENTE,
    observacoes: "",
  });

  assert.equal(
    mensagem,
    [
      "Olá! Gostaria de fazer um pedido:",
      "",
      "*Itens:*",
      `• Buquê Bella (x2) — ${brl("179,80")}`,
      `• Buquê Jardim — ${brl("129,99")}`,
      "",
      `*Subtotal:* ${brl("309,79")}`,
      `*Entrega:* Correios PAC — ${brl("23,47")} (7 dia(s))`,
      `*Pagamento:* Cartão de crédito em 3x de ${brl("119,34")}`,
      `*Total no cartão:* ${brl("358,02")}`,
      "",
      "*Endereço de entrega:*",
      "Rua das Flores, 123 - Ap 4",
      "Centro — São Paulo/SP",
      "CEP: 01001-000",
      "",
      "*Dados do cliente:*",
      "Nome: Ana Souza",
      "Telefone: (67) 99999-0000",
    ].join("\n"),
  );
});

test("Pix com entrega local, sem complemento e com observações aparadas", () => {
  const itens = [item(bella, 1)];
  const subtotal = calcularSubtotal(itens);
  const totais = calcularTotaisPedido({ subtotal, frete: 0, formaPagamento: "pix", parcelas: 2 });

  const mensagem = montarMensagemPedido({
    itens,
    subtotal,
    frete: null,
    freteLocal: true,
    formaPagamento: "pix",
    parcelas: 2,
    totais,
    endereco: { ...ENDERECO, complemento: "" },
    cliente: CLIENTE,
    observacoes: "  Entregar à tarde  ",
  });

  assert.equal(
    mensagem,
    [
      "Olá! Gostaria de fazer um pedido:",
      "",
      "*Itens:*",
      `• Buquê Bella — ${brl("89,90")}`,
      "",
      `*Subtotal:* ${brl("89,90")}`,
      "*Entrega:* local (Dourados/MS) — combinar valor por aqui",
      "*Pagamento:* Pix",
      `*Total:* ${brl("89,90")}`,
      "",
      "*Endereço de entrega:*",
      "Rua das Flores, 123",
      "Centro — Dourados/MS",
      "CEP: 79800-000",
      "",
      "*Dados do cliente:*",
      "Nome: Ana Souza",
      "Telefone: (67) 99999-0000",
      "",
      "*Observações:* Entregar à tarde",
    ].join("\n"),
  );
});

test("sem frete calculado não há linha de entrega; prazo nulo omite os dias", () => {
  const itens = [item(bella, 1)];
  const base = {
    itens,
    subtotal: 89.9,
    freteLocal: false,
    formaPagamento: "pix" as const,
    parcelas: 1,
    endereco: ENDERECO,
    cliente: CLIENTE,
    observacoes: "   ",
  };

  const semFrete = montarMensagemPedido({
    ...base,
    frete: null,
    totais: calcularTotaisPedido({ subtotal: 89.9, frete: 0, formaPagamento: "pix", parcelas: 1 }),
  });
  assert.ok(!semFrete.includes("*Entrega:*"));
  assert.ok(!semFrete.includes("*Observações:*"));

  const semPrazo = montarMensagemPedido({
    ...base,
    frete: { ...PAC, prazoDias: null },
    totais: calcularTotaisPedido({ subtotal: 89.9, frete: PAC.preco, formaPagamento: "pix", parcelas: 1 }),
  });
  assert.ok(semPrazo.includes(`*Entrega:* Correios PAC — ${brl("23,47")}\n`));
  assert.ok(semPrazo.includes(`*Total:* ${brl("113,37")}`));
});

test("item sob consulta que ficou no carrinho entra com valor zero", () => {
  const consulta = produto("p3", "Luminária", null);
  const itens = [item(consulta, 2)];
  const mensagem = montarMensagemPedido({
    itens,
    subtotal: calcularSubtotal(itens),
    frete: null,
    freteLocal: false,
    formaPagamento: "pix",
    parcelas: 1,
    totais: calcularTotaisPedido({ subtotal: 0, frete: 0, formaPagamento: "pix", parcelas: 1 }),
    endereco: ENDERECO,
    cliente: CLIENTE,
    observacoes: "",
  });
  assert.ok(mensagem.includes(`• Luminária (x2) — ${brl("0,00")}`));
});
