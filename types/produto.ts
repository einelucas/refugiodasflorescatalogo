/* =========================================================
   Contratos de produto.
   · Input (validação/API): inferido do Zod em lib/validacao.ts.
   · Apresentação (catálogo público): ProdutoCatalogo.
   · Formulário do painel: ProdutoForm.
   Decimais do Prisma já chegam aqui convertidos para number.
   ========================================================= */

export type { ProdutoInput } from "@/lib/validacao";

/// Imagem pronta para exibição: alt sempre preenchido (cai no nome
/// do produto quando a foto não tem texto alternativo).
export type ImagemCatalogo = { url: string; alt: string };

/// Produto como o catálogo público recebe. Sem peso, dimensões nem
/// valor declarado — esses ficam só no servidor.
export type ProdutoCatalogo = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number | null;
  sobConsulta: boolean;
  badge: string | null;
  freteHabilitado: boolean;
  imagens: ImagemCatalogo[];
};

/// Produto junto do nome da categoria em que aparece no catálogo.
export type ProdutoComCategoria = { produto: ProdutoCatalogo; categoria: string };

/// Imagem como é editada no painel: alt pode estar vazio.
export type ImagemForm = { url: string; alt: string | null };

export type ProdutoForm = {
  id?: string;
  nome: string;
  categoriaId: string;
  descricao: string | null;
  preco: number | null;
  sobConsulta: boolean;
  badge: string | null;
  pesoKg: number;
  alturaCm: number;
  larguraCm: number;
  comprimentoCm: number;
  valorDeclarado: number | null;
  freteHabilitado: boolean;
  medidasVerificadas: boolean;
  ordem: number;
  ativo: boolean;
  imagens: ImagemForm[];
};
