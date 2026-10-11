/* =========================================================
   Regras de pagamento — fonte única das taxas de cartão.
   ========================================================= */

// Preço à vista (Pix) é o valor cheio; no cartão embutimos a taxa da
// maquininha, que varia por número de parcelas — inclusive em 1x, que
// já cobra taxa (só o Pix é isento).
export const TAXAS_PARCELAMENTO: Record<number, number> = {
  1: 0.042,
  2: 0.0609,
  3: 0.0743,
};

export const PARCELAS_MAXIMAS = 3;
