/* =========================================================
   Integração com a Frenet.
   Isolada aqui para que tanto a rota pública quanto o
   "testar frete" do admin usem exatamente a mesma lógica —
   caso contrário o teste do painel mentiria sobre o resultado
   real visto pelo cliente final.
   ========================================================= */

const ENDPOINT = "https://api.frenet.com.br/shipping/quote";

export type DimensoesPacote = {
  pesoKg: number;
  alturaCm: number;
  larguraCm: number;
  comprimentoCm: number;
};

export type OpcaoFrete = {
  transportadora: string;
  servico: string;
  codigoServico: string;
  preco: number;
  prazoDias: number | null;
};

export type ResultadoFrete =
  | { ok: true; opcoes: OpcaoFrete[]; aviso?: string }
  | { ok: false; status: number; erro: string };

type RespostaFrenet = {
  ShippingSevicesArray?: Array<{
    ServiceCode?: string;
    ServiceDescription?: string;
    Carrier?: string;
    ShippingPrice?: string | number;
    DeliveryTime?: string | number;
    Error?: boolean;
    Msg?: string;
  }>;
  Message?: string;
};

export async function cotarFrete(params: {
  itens: { dimensoes: DimensoesPacote; quantidade: number }[];
  valorDeclarado: number;
  cepDestino: string;
}): Promise<ResultadoFrete> {
  const { FRENET_TOKEN, CEP_ORIGEM } = process.env;

  if (!FRENET_TOKEN || !CEP_ORIGEM) {
    console.error("[frenet] FRENET_TOKEN ou CEP_ORIGEM ausentes.");
    return {
      ok: false,
      status: 500,
      erro: "Serviço de frete temporariamente indisponível.",
    };
  }

  const corpo = {
    SellerCEP: CEP_ORIGEM.replace(/\D/g, ""),
    RecipientCEP: params.cepDestino.replace(/\D/g, ""),
    ShipmentInvoiceValue: Number(params.valorDeclarado.toFixed(2)),
    ShippingServiceCode: null,
    // Um item por produto distinto do carrinho — a Frenet faz a
    // cubagem consolidada a partir de todos eles (via Quantity em
    // cada um), o que dá um preço real de caixa única em vez de
    // somar N cotações de item avulso.
    ShippingItemArray: params.itens.map((item) => ({
      Height: item.dimensoes.alturaCm,
      Length: item.dimensoes.comprimentoCm,
      Width: item.dimensoes.larguraCm,
      Weight: item.dimensoes.pesoKg,
      Quantity: item.quantidade,
    })),
    RecipientCountry: "BR",
  };

  let resposta: Response;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    resposta = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        token: FRENET_TOKEN,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(corpo),
      signal: controller.signal,
    });
    clearTimeout(timeout);
  } catch (erro) {
    console.error("[frenet] falha de rede:", erro);
    return {
      ok: false,
      status: 502,
      erro: "Não foi possível consultar o frete agora. Tente novamente em instantes.",
    };
  }

  if (!resposta.ok) {
    console.error("[frenet] status inesperado:", resposta.status);
    return {
      ok: false,
      status: 502,
      erro: "Não foi possível calcular o frete agora. Tente novamente em instantes.",
    };
  }

  let dados: RespostaFrenet;
  try {
    dados = (await resposta.json()) as RespostaFrenet;
  } catch (erro) {
    console.error("[frenet] resposta não-JSON:", erro);
    return { ok: false, status: 502, erro: "Resposta inesperada do serviço de frete." };
  }

  const servicos = dados.ShippingSevicesArray ?? [];

  // A Frenet devolve serviços com Error: true junto dos válidos.
  // Se não filtrar, o cliente escolhe uma opção que falha depois.
  const opcoes: OpcaoFrete[] = servicos
    .filter((s) => !s.Error && s.ShippingPrice != null)
    .map((s) => ({
      transportadora: s.Carrier || "Transportadora",
      servico: s.ServiceDescription || "Entrega",
      codigoServico: s.ServiceCode || "",
      preco: Number(s.ShippingPrice),
      prazoDias: s.DeliveryTime != null ? Number(s.DeliveryTime) : null,
    }))
    .filter((o) => Number.isFinite(o.preco) && o.preco > 0)
    .sort((a, b) => a.preco - b.preco);

  if (!opcoes.length) {
    const motivo = servicos.find((s) => s.Error && s.Msg)?.Msg;
    if (motivo) console.warn("[frenet] sem opções:", motivo);
    return {
      ok: true,
      opcoes: [],
      aviso: "Nenhuma opção de frete disponível para este CEP.",
    };
  }

  return { ok: true, opcoes };
}
