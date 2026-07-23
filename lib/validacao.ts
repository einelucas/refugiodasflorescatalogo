/* =========================================================
   Schemas Zod — fonte única de validação.
   Usados no formulário do painel e nas rotas de API.
   O formulário é conveniência; a rota é a defesa.
   ========================================================= */

import { z } from "zod";

// Limites dos Correios para pacote. Espelham os CHECK do banco.
export const LIMITES = {
  pesoMaxKg: 30,
  alturaMin: 2,
  larguraMin: 11,
  comprimentoMin: 16,
  somaMax: 200,
  dimensaoMax: 100,
} as const;

const dimensoesBase = {
  pesoKg: z.coerce
    .number({ invalid_type_error: "Peso inválido." })
    .positive("O peso deve ser maior que zero.")
    .max(LIMITES.pesoMaxKg, `Peso máximo: ${LIMITES.pesoMaxKg} kg.`),
  alturaCm: z.coerce
    .number()
    .min(LIMITES.alturaMin, `Altura mínima: ${LIMITES.alturaMin} cm.`)
    .max(LIMITES.dimensaoMax),
  larguraCm: z.coerce
    .number()
    .min(LIMITES.larguraMin, `Largura mínima: ${LIMITES.larguraMin} cm.`)
    .max(LIMITES.dimensaoMax),
  comprimentoCm: z.coerce
    .number()
    .min(LIMITES.comprimentoMin, `Comprimento mínimo: ${LIMITES.comprimentoMin} cm.`)
    .max(LIMITES.dimensaoMax),
};

const somaOk = (d: { alturaCm: number; larguraCm: number; comprimentoCm: number }) =>
  d.alturaCm + d.larguraCm + d.comprimentoCm <= LIMITES.somaMax;

const msgSoma: { message: string; path: (string | number)[] } = {
  message: `A soma das três dimensões não pode passar de ${LIMITES.somaMax} cm.`,
  path: ["alturaCm"],
};

export const produtoSchema = z
  .object({
    ...dimensoesBase,
    nome: z.string().trim().min(2, "Informe o nome.").max(120),
    categoriaId: z.string().uuid("Selecione uma categoria."),
    descricao: z.string().trim().max(2000).nullable().optional(),
    /// Nulo quando sobConsulta = true.
    preco: z.coerce.number().positive().max(100000).nullable().optional(),
    sobConsulta: z.coerce.boolean().default(false),
    badge: z.string().trim().max(40).nullable().optional(),
    valorDeclarado: z.coerce.number().positive().max(100000).nullable().optional(),
    freteHabilitado: z.coerce.boolean().default(true),
    medidasVerificadas: z.coerce.boolean().default(false),
    ordem: z.coerce.number().int().min(0).default(0),
    ativo: z.coerce.boolean().default(true),
    imagens: z
      .array(
        z.object({
          url: z.string().url("URL de imagem inválida."),
          alt: z.string().max(200).nullable().optional(),
          ordem: z.coerce.number().int().min(0).default(0),
        }),
      )
      .max(10, "Máximo de 10 imagens por produto.")
      .default([]),
  })
  .refine(somaOk, msgSoma)
  // Espelha a constraint produtos_preco_coerente do banco.
  .refine((d) => (d.sobConsulta ? d.preco == null : d.preco != null && d.preco > 0), {
    message: 'Informe um preço, ou marque "sob consulta".',
    path: ["preco"],
  });

export const categoriaSchema = z.object({
  nome: z.string().trim().min(2).max(60),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen."),
  titulo: z.string().trim().min(2).max(80),
  subtitulo: z.string().trim().max(200).nullable().optional(),
  aliases: z.array(z.string().trim().max(60)).max(5).default([]),
  iconeUrl: z.string().url().nullable().optional(),
  ordem: z.coerce.number().int().min(0).default(0),
  ativa: z.coerce.boolean().default(true),
});

export const paginaSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen."),
  titulo: z.string().trim().min(2).max(120),
  conteudoHtml: z.string().max(50000).nullable().optional(),
  visivelNoMenu: z.coerce.boolean().default(true),
  ordem: z.coerce.number().int().min(0).default(0),
});

export const embalagemSchema = z
  .object({
    nome: z.string().trim().min(2).max(80),
    alturaCm: dimensoesBase.alturaCm,
    larguraCm: dimensoesBase.larguraCm,
    comprimentoCm: dimensoesBase.comprimentoCm,
    pesoTaraKg: z.coerce.number().min(0).max(5).default(0),
  })
  .refine(somaOk, msgSoma);

// ── Frete ──

const cepSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, ""))
  .refine((v) => v.length === 8, "CEP inválido.");

/// Rota PÚBLICA: aceita apenas o id. Dimensões vêm do banco.
export const calcularFretePublicoSchema = z.object({
  produtoId: z.string().uuid(),
  quantidade: z.coerce.number().int().min(1).max(10),
  cepDestino: cepSchema,
});

/// Rota do ADMIN: aceita dimensões avulsas para o botão "Testar
/// frete" antes de salvar. Única exceção ao princípio de nunca
/// aceitar dimensões do cliente — por isso fica isolada atrás
/// de autenticação.
export const testarFreteSchema = z
  .object({
    ...dimensoesBase,
    cepDestino: cepSchema,
    quantidade: z.coerce.number().int().min(1).max(10).default(1),
    valorDeclarado: z.coerce.number().positive().max(100000).default(100),
  })
  .refine(somaOk, msgSoma);

export type ProdutoInput = z.infer<typeof produtoSchema>;
export type CategoriaInput = z.infer<typeof categoriaSchema>;
export type PaginaInput = z.infer<typeof paginaSchema>;
export type EmbalagemInput = z.infer<typeof embalagemSchema>;
