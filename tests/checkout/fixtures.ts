import type {
  DadosCliente,
  EnderecoEntrega,
  ItemCarrinhoResolvido,
  OpcaoFrete,
  ProdutoCatalogo,
} from "@/types";

/// "R$ 1.234,56" com o espaço não separável que o Intl usa no pt-BR.
export const brl = (valor: string) => `R$${String.fromCharCode(160)}${valor}`;

export function produto(id: string, nome: string, preco: number | null): ProdutoCatalogo {
  return {
    id,
    nome,
    descricao: null,
    preco,
    sobConsulta: preco === null,
    badge: null,
    freteHabilitado: true,
    imagens: [],
  };
}

export function item(p: ProdutoCatalogo, quantidade: number): ItemCarrinhoResolvido {
  return { produtoId: p.id, quantidade, produto: p };
}

export const PAC: OpcaoFrete = {
  transportadora: "Correios",
  servico: "PAC",
  codigoServico: "04510",
  preco: 23.47,
  prazoDias: 7,
};

export const ENDERECO: EnderecoEntrega = {
  cep: "79800-000",
  rua: "Rua das Flores",
  numero: "123",
  complemento: "Ap 4",
  bairro: "Centro",
  cidade: "Dourados",
  estado: "MS",
};

export const CLIENTE: DadosCliente = { nome: "Ana Souza", telefone: "(67) 99999-0000" };
