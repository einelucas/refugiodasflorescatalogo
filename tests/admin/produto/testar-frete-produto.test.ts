import assert from "node:assert/strict";
import { test } from "node:test";
import { criarPayloadTesteFrete } from "@/lib/admin/produto/formulario";
import { testarFreteProduto } from "@/lib/client/testar-frete-produto";
import { PRODUTO } from "./fixtures";

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
  new Response(JSON.stringify(corpo), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const PAC = {
  transportadora: "Correios",
  servico: "PAC",
  codigoServico: "03298",
  preco: 24.5,
  prazoDias: 5,
};

test("teste administrativo preserva rota, método e payload de medidas avulsas", async () => {
  const payload = criarPayloadTesteFrete(PRODUTO, "01001-000");
  const { fn, chamadas } = fetchFalso(() => json({ opcoes: [PAC] }));

  assert.deepEqual(await testarFreteProduto(payload, fn), { ok: true, opcoes: [PAC] });
  assert.equal(chamadas.length, 1);
  assert.equal(chamadas[0].url, "/api/admin/testar-frete");
  assert.equal(chamadas[0].init.method, "POST");
  assert.deepEqual(JSON.parse(String(chamadas[0].init.body)), payload);
});

test("teste administrativo preserva mensagens da API e fallbacks", async () => {
  const payload = criarPayloadTesteFrete(PRODUTO, "01001-000");
  const casos: [Response, string][] = [
    [json({ erro: "CEP inválido." }, 400), "CEP inválido."],
    [json({}, 500), "Não foi possível testar."],
    [json({ opcoes: [], aviso: "Sem cobertura." }), "Sem cobertura."],
    [json({ opcoes: [] }), "Nenhuma opção de frete para essas medidas."],
  ];

  for (const [resposta, erro] of casos) {
    const { fn } = fetchFalso(() => resposta);
    assert.deepEqual(await testarFreteProduto(payload, fn), { ok: false, erro });
  }
});

test("falha de rede ou JSON inválido mantém erro de conexão", async () => {
  const payload = criarPayloadTesteFrete(PRODUTO, "01001-000");
  const esperado = { ok: false, erro: "Erro de conexão ao testar o frete." };

  const rede = fetchFalso(() => Promise.reject(new TypeError("Failed to fetch")));
  assert.deepEqual(await testarFreteProduto(payload, rede.fn), esperado);

  const html = fetchFalso(() => new Response("<html>erro</html>", { status: 502 }));
  assert.deepEqual(await testarFreteProduto(payload, html.fn), esperado);
});
