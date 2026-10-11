/* =========================================================
   Contratos de frete: cotação Frenet, respostas das rotas
   /api/calcular-frete e /api/admin/testar-frete, e ViaCEP.
   ========================================================= */

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

/// Resultado interno de cotarFrete (lib/frenet.ts).
export type ResultadoFrete =
  | { ok: true; opcoes: OpcaoFrete[]; aviso?: string }
  | { ok: false; status: number; erro: string };

/// Corpo JSON devolvido pelas rotas de frete: { opcoes, aviso } no
/// sucesso, { erro } na falha.
export type RespostaFrete = {
  opcoes?: OpcaoFrete[];
  aviso?: string;
  erro?: string;
};

/// Resposta de https://viacep.com.br/ws/<cep>/json/
export type EnderecoViaCep = {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};
