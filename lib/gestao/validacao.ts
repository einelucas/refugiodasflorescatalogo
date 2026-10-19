import { z } from "zod";
export const uuid = z.string().uuid();
export const estoqueSchema = z.object({ nome: z.string().trim().min(2).max(120), quantidade: z.number().finite().min(0), unidade: z.string().trim().min(1).max(20).default("un") });
export const fichaSchema = z.object({ produtoId: uuid, ingredientes: z.array(z.object({ materiaPrimaId: uuid, quantidade: z.number().finite().positive() })).max(100) }).refine(x => new Set(x.ingredientes.map(i => i.materiaPrimaId)).size === x.ingredientes.length, "Matéria-prima duplicada");
export const producaoSchema = z.object({ produtoId: uuid, quantidade: z.number().int().positive().max(10000) });
export const vendaSchema = producaoSchema.extend({ cliente: z.string().trim().max(200).optional() });
export const despesaSchema = z.object({ descricao: z.string().trim().min(2).max(240), valor: z.number().finite().positive(), categoria: z.enum(["materiais", "marketing", "equipamentos", "outros"]) });
export function mesPeriodo(input: string | null) {
  if (!input || !/^\d{4}-(0[1-9]|1[0-2])$/.test(input)) return null;
  const [ano, mes] = input.split("-").map(Number);
  return { inicio: new Date(Date.UTC(ano, mes - 1, 1)), fim: new Date(Date.UTC(ano, mes, 1)) };
}
