import type { ItemCarrinho } from "@/types";

/// Identifica o carrinho em que uma cotação de frete foi feita: itens
/// e quantidades, CEP e se o endereço é de entrega local. Se a chave
/// muda, a cotação deixa de valer.
export function chaveCotacaoCarrinho(itens: ItemCarrinho[], cep: string, local: boolean): string {
  const itensChave = itens.map((item) => `${item.produtoId}:${item.quantidade}`).join(",");
  return `${itensChave}|${cep.replace(/\D/g, "")}|${local ? "local" : "frenet"}`;
}
