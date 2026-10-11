import type { RespostaFrete } from "@/types";

type PayloadTesteFrete = {
  pesoKg: number;
  alturaCm: number;
  larguraCm: number;
  comprimentoCm: number;
  valorDeclarado: number;
  cepDestino: string;
  quantidade: number;
};

export type ResultadoTesteFrete =
  | { ok: true; opcoes: NonNullable<RespostaFrete["opcoes"]> }
  | { ok: false; erro: string };

export async function testarFreteProduto(
  payload: PayloadTesteFrete,
  fetcher: typeof fetch = fetch,
): Promise<ResultadoTesteFrete> {
  try {
    const resposta = await fetcher("/api/admin/testar-frete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const dados: RespostaFrete = await resposta.json();

    if (!resposta.ok) {
      return { ok: false, erro: dados.erro ?? "Não foi possível testar." };
    }
    if (!dados.opcoes?.length) {
      return {
        ok: false,
        erro: dados.aviso ?? "Nenhuma opção de frete para essas medidas.",
      };
    }
    return { ok: true, opcoes: dados.opcoes };
  } catch {
    return { ok: false, erro: "Erro de conexão ao testar o frete." };
  }
}
