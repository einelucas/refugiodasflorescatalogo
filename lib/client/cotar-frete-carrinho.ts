/* =========================================================
   Cotação consolidada do carrinho em /api/calcular-frete.
   Envia todos os itens numa única chamada (a Frenet cota a
   caixa consolidada) e só ids + quantidades: peso e medidas
   vêm do banco, nunca do navegador.
   ========================================================= */

import type { ItemCarrinho, OpcaoFrete, RespostaFrete } from "@/types";

export type ResultadoCotacaoCarrinho =
  | { ok: true; opcoes: OpcaoFrete[] }
  | { ok: false; erro: string };

export function montarPayloadFreteCarrinho(itens: ItemCarrinho[], cepDestino: string) {
  return {
    itens: itens.map((item) => ({ produtoId: item.produtoId, quantidade: item.quantidade })),
    cepDestino,
  };
}

export async function cotarFreteCarrinho(
  itens: ItemCarrinho[],
  cepDestino: string,
  fetchFn: typeof fetch = fetch,
): Promise<ResultadoCotacaoCarrinho> {
  try {
    const resposta = await fetchFn("/api/calcular-frete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(montarPayloadFreteCarrinho(itens, cepDestino)),
    });
    const dados: RespostaFrete = await resposta.json();

    if (!resposta.ok) {
      return { ok: false, erro: dados.erro ?? "Não foi possível calcular o frete." };
    }
    if (!dados.opcoes?.length) {
      return { ok: false, erro: dados.aviso ?? "Nenhuma opção de entrega para este CEP." };
    }
    return { ok: true, opcoes: dados.opcoes };
  } catch {
    return { ok: false, erro: "Erro de conexão. Tente novamente." };
  }
}
