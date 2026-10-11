import { formatarBRL } from "@/lib/utils";

type NumericValue = number | string | { toString(): string } | null;

export type AdminProductListItem = {
  id: string;
  nome: string;
  sobConsulta: boolean;
  preco: NumericValue;
  ativo: boolean;
  alturaCm: NumericValue;
  larguraCm: NumericValue;
  comprimentoCm: NumericValue;
  pesoKg: NumericValue;
  categoria: { nome: string };
  imagens: Array<{ url: string }>;
};

export function productPriceLabel(
  product: Pick<AdminProductListItem, "sobConsulta" | "preco">,
  capitalize = false,
): string {
  if (product.sobConsulta) return capitalize ? "A consultar" : "a consultar";
  return formatarBRL(Number(product.preco));
}

export function productPackagingLabel(
  product: Pick<
    AdminProductListItem,
    "alturaCm" | "larguraCm" | "comprimentoCm" | "pesoKg"
  >,
): string {
  return `${Number(product.alturaCm)}×${Number(product.larguraCm)}×${Number(
    product.comprimentoCm,
  )} cm · ${Number(product.pesoKg)} kg`;
}

export function productThumbnailUrl(
  product: Pick<AdminProductListItem, "imagens">,
): string | null {
  return product.imagens[0]?.url ?? null;
}
