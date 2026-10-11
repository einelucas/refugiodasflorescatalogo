/* =========================================================
   Regras para liberar o envio do pedido pelo WhatsApp.
   ========================================================= */

import type { DadosCliente, EnderecoEntrega } from "@/types";

export function cepCompleto(cep: string): boolean {
  return cep.replace(/\D/g, "").length === 8;
}

/// Complemento é opcional; o resto do endereço é obrigatório.
export function enderecoValido(endereco: EnderecoEntrega): boolean {
  return (
    cepCompleto(endereco.cep) &&
    endereco.rua.trim().length > 0 &&
    endereco.numero.trim().length > 0 &&
    endereco.bairro.trim().length > 0 &&
    endereco.cidade.trim().length > 0 &&
    endereco.estado.trim().length === 2
  );
}

export function dadosClienteValidos(cliente: DadosCliente): boolean {
  return cliente.nome.trim().length > 1 && cliente.telefone.replace(/\D/g, "").length >= 10;
}

export function checkoutValido({
  cliente,
  endereco,
  quantidadeItens,
}: {
  cliente: DadosCliente;
  endereco: EnderecoEntrega;
  quantidadeItens: number;
}): boolean {
  return dadosClienteValidos(cliente) && enderecoValido(endereco) && quantidadeItens > 0;
}
