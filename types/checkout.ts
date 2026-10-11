/* =========================================================
   Contratos do checkout do carrinho.
   ========================================================= */

export type DadosCliente = { nome: string; telefone: string };

/// Endereço como digitado no checkout. `cep` fica mascarado
/// ("00000-000"); `estado` já em maiúsculas.
export type EnderecoEntrega = {
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
};

/// Campos do endereço editados à mão (o CEP tem fluxo próprio).
export type CampoEndereco = Exclude<keyof EnderecoEntrega, "cep">;

/// Estado da consulta de endereço pelo CEP (ViaCEP).
export type StatusCep = "idle" | "buscando" | "sucesso" | "erro";

/// Valores do pedido. A taxa do cartão incide sobre produtos + frete.
export type TotaisPedido = {
  /// Produtos + frete escolhido (valor no Pix).
  totalBase: number;
  /// totalBase no Pix; totalBase com a taxa no cartão.
  totalFinal: number;
  /// Valor de cada parcela no cartão, no número de parcelas escolhido.
  valorParcela: number;
};
