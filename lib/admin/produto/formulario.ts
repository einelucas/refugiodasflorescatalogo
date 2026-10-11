import { LIMITES } from "@/config/frete";
import { TAMANHO_MAXIMO_IMAGEM, TIPOS_IMAGEM_ACEITOS } from "@/config/upload";
import type { CategoriaOpcao, Embalagem, ProdutoForm } from "@/types";

export const CAMPOS_MEDIDAS = [
  "pesoKg",
  "alturaCm",
  "larguraCm",
  "comprimentoCm",
] as const satisfies readonly (keyof ProdutoForm)[];

export type CampoMedida = (typeof CAMPOS_MEDIDAS)[number];

const CAMPOS_TESTE_FRETE = [
  ...CAMPOS_MEDIDAS,
  "preco",
  "valorDeclarado",
] as const satisfies readonly (keyof ProdutoForm)[];

export function campoInvalidaMedidas(campo: keyof ProdutoForm): campo is CampoMedida {
  return CAMPOS_MEDIDAS.includes(campo as CampoMedida);
}

export function campoInvalidaTesteFrete(campo: keyof ProdutoForm): boolean {
  return CAMPOS_TESTE_FRETE.includes(campo as (typeof CAMPOS_TESTE_FRETE)[number]);
}

export function criarProdutoInicial(categorias: CategoriaOpcao[]): ProdutoForm {
  return {
    nome: "",
    categoriaId: categorias[0]?.id ?? "",
    descricao: "",
    preco: null,
    sobConsulta: false,
    badge: "",
    pesoKg: 0,
    alturaCm: 0,
    larguraCm: 0,
    comprimentoCm: 0,
    valorDeclarado: null,
    freteHabilitado: true,
    medidasVerificadas: false,
    ordem: 0,
    ativo: false,
    imagens: [],
  };
}

export function atualizarCampoProduto<K extends keyof ProdutoForm>(
  produto: ProdutoForm,
  campo: K,
  valor: ProdutoForm[K],
): ProdutoForm {
  const atualizado = { ...produto, [campo]: valor };
  if (campoInvalidaMedidas(campo)) atualizado.medidasVerificadas = false;
  return atualizado;
}

export function aplicarEmbalagemAoProduto(
  produto: ProdutoForm,
  embalagem: Embalagem,
): ProdutoForm {
  return {
    ...produto,
    alturaCm: embalagem.alturaCm,
    larguraCm: embalagem.larguraCm,
    comprimentoCm: embalagem.comprimentoCm,
    medidasVerificadas: false,
  };
}

export function resumoDimensoes(produto: ProdutoForm) {
  const soma =
    Number(produto.alturaCm || 0) +
    Number(produto.larguraCm || 0) +
    Number(produto.comprimentoCm || 0);
  return { soma, somaExcedida: soma > LIMITES.somaMax };
}

export function criarPayloadProduto(produto: ProdutoForm) {
  return {
    ...produto,
    preco: produto.sobConsulta ? null : produto.preco,
    descricao: produto.descricao || null,
    badge: produto.badge || null,
    valorDeclarado: produto.valorDeclarado || null,
    imagens: produto.imagens.map((imagem, ordem) => ({
      url: imagem.url,
      alt: imagem.alt,
      ordem,
    })),
  };
}

export function criarPayloadTesteFrete(produto: ProdutoForm, cepDestino: string) {
  return {
    pesoKg: produto.pesoKg,
    alturaCm: produto.alturaCm,
    larguraCm: produto.larguraCm,
    comprimentoCm: produto.comprimentoCm,
    valorDeclarado: produto.valorDeclarado ?? produto.preco ?? 100,
    cepDestino,
    quantidade: 1,
  };
}

export function erroArquivoImagem(arquivo: Pick<File, "type" | "size">): string | null {
  if (!TIPOS_IMAGEM_ACEITOS.includes(arquivo.type)) {
    return "Use uma imagem JPG, PNG, WebP ou AVIF.";
  }
  if (arquivo.size > TAMANHO_MAXIMO_IMAGEM) {
    return "A imagem deve ter no máximo 6 MB.";
  }
  return null;
}
