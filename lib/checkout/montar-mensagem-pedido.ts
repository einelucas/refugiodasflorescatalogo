/* =========================================================
   Texto do pedido enviado pelo WhatsApp a partir do carrinho.
   Função pura: recebe os dados já validados e devolve a
   mensagem; o link wa.me fica com montarLinkWhatsApp.
   ========================================================= */

import { formatarBRL, mascararCEP } from "@/lib/utils";
import type {
  DadosCliente,
  EnderecoEntrega,
  FormaPagamento,
  ItemCarrinhoResolvido,
  OpcaoFrete,
  TotaisPedido,
} from "@/types";
import { calcularPrecoItem } from "./itens";

export type DadosMensagemPedido = {
  itens: ItemCarrinhoResolvido[];
  subtotal: number;
  /// Opção da Frenet escolhida; null quando ainda não cotado ou local.
  frete: OpcaoFrete | null;
  /// Endereço em Dourados/MS: entrega própria, valor combinado depois.
  freteLocal: boolean;
  formaPagamento: FormaPagamento;
  parcelas: number;
  totais: TotaisPedido;
  endereco: EnderecoEntrega;
  cliente: DadosCliente;
  observacoes: string;
};

export function montarMensagemPedido({
  itens,
  subtotal,
  frete,
  freteLocal,
  formaPagamento,
  parcelas,
  totais,
  endereco,
  cliente,
  observacoes,
}: DadosMensagemPedido): string {
  const linhas = ["Olá! Gostaria de fazer um pedido:", "", "*Itens:*"];

  for (const item of itens) {
    linhas.push(
      `• ${item.produto.nome}${item.quantidade > 1 ? ` (x${item.quantidade})` : ""} — ${formatarBRL(calcularPrecoItem(item))}`,
    );
  }

  linhas.push("", `*Subtotal:* ${formatarBRL(subtotal)}`);

  if (frete) {
    linhas.push(
      `*Entrega:* ${frete.transportadora} ${frete.servico} — ${formatarBRL(frete.preco)}` +
        (frete.prazoDias != null ? ` (${frete.prazoDias} dia(s))` : ""),
    );
  } else if (freteLocal) {
    linhas.push("*Entrega:* local (Dourados/MS) — combinar valor por aqui");
  }

  if (formaPagamento === "credito") {
    linhas.push(
      `*Pagamento:* Cartão de crédito em ${parcelas}x de ${formatarBRL(totais.valorParcela)}`,
      `*Total no cartão:* ${formatarBRL(totais.totalFinal)}`,
    );
  } else {
    linhas.push("*Pagamento:* Pix", `*Total:* ${formatarBRL(totais.totalFinal)}`);
  }

  linhas.push(
    "",
    "*Endereço de entrega:*",
    `${endereco.rua}, ${endereco.numero}${endereco.complemento ? ` - ${endereco.complemento}` : ""}`,
    `${endereco.bairro} — ${endereco.cidade}/${endereco.estado}`,
    `CEP: ${mascararCEP(endereco.cep)}`,
    "",
    "*Dados do cliente:*",
    `Nome: ${cliente.nome}`,
    `Telefone: ${cliente.telefone}`,
  );

  if (observacoes.trim()) {
    linhas.push("", `*Observações:* ${observacoes.trim()}`);
  }

  return linhas.join("\n");
}
