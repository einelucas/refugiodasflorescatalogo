/* =========================================================
   Regras de frete compartilhadas por validação, painel e
   checkout.
   ========================================================= */

// Limites dos Correios para pacote. Espelham os CHECK do banco.
export const LIMITES = {
  pesoMaxKg: 30,
  alturaMin: 2,
  larguraMin: 11,
  comprimentoMin: 16,
  somaMax: 200,
  dimensaoMax: 100,
} as const;

/// Dourados/MS é entrega própria (carro/moto), não Correios ou
/// transportadora. Cidade comparada já normalizada (sem acento,
/// minúscula); UF em maiúsculas.
export const ENTREGA_LOCAL = {
  cidade: "dourados",
  uf: "MS",
} as const;
