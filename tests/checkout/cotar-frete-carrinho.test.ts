import assert from "node:assert/strict";
import { test } from "node:test";
import { cotarFreteCarrinho } from "@/lib/client/cotar-frete-carrinho";
import { PAC, item, produto } from "./fixtures";

type Chamada = { url: string; init: RequestInit };

function fetchFalso(resposta: () => Response | Promise<Response>) {
  const chamadas: Chamada[] = [];
  const fn = (async (url: string, init: RequestInit) => {
    chamadas.push({ url, init });
    return resposta();
  }) as unknown as typeof fetch;
  return { fn, chamadas };
}

const json = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } });

const itens = [item(produto("p1", "Bella", 89.9), 1), item(produto("p2", "Jardim", 129.99), 2)];

test("envia todos os itens numa única cotação, só com id e quantidade", async () => {
  const { fn, chamadas } = fetchFalso(() => json({ opcoes: [PAC] }));
  const resultado = await cotarFreteCarrinho(itens, "79800000", fn);

  assert.deepEqual(resultado, { ok: true, opcoes: [PAC] });
  assert.equal(chamadas.length, 1);
  assert.equal(chamadas[0].url, "/api/calcular-frete");
  assert.equal(chamadas[0].init.method, "POST");
  assert.deepEqual(JSON.parse(String(chamadas[0].init.body)), {
    itens: [
      { produtoId: "p1", quantidade: 1 },
      { produtoId: "p2", quantidade: 2 },
    ],
    cepDestino: "79800000",
  });
});

test("erros da API e lista vazia usam a mensagem do servidor ou o texto padrão", async () => {
  const casos: [Response, string][] = [
    [json({ erro: "Produto não encontrado." }, 404), "Produto não encontrado."],
    [json({}, 500), "Não foi possível calcular o frete."],
    [json({ opcoes: [], aviso: "Nenhuma opção de frete disponível para este CEP." }), "Nenhuma opção de frete disponível para este CEP."],
    [json({ opcoes: [] }), "Nenhuma opção de entrega para este CEP."],
  ];
  for (const [resposta, erro] of casos) {
    const { fn } = fetchFalso(() => resposta);
    assert.deepEqual(await cotarFreteCarrinho(itens, "79800000", fn), { ok: false, erro });
  }
});

test("falha de rede ou resposta que não é JSON vira erro de conexão", async () => {
  const conexao = { ok: false, erro: "Erro de conexão. Tente novamente." };

  const rede = fetchFalso(() => Promise.reject(new TypeError("Failed to fetch")));
  assert.deepEqual(await cotarFreteCarrinho(itens, "79800000", rede.fn), conexao);

  const html = fetchFalso(() => new Response("<html>502</html>", { status: 502 }));
  assert.deepEqual(await cotarFreteCarrinho(itens, "79800000", html.fn), conexao);
});
