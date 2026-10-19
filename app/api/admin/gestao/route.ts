import { Prisma } from "@prisma/client";
import { ZodError, z } from "zod";
import { exigirAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { serializar } from "@/lib/serializar";
import { GestaoErro, excluirMateriaPrima, registrarDespesa, registrarProducao, registrarVenda, salvarFicha, salvarMateriaPrima } from "@/lib/gestao/servico";

export const dynamic = "force-dynamic";
const idSchema = z.string().uuid();
function falha(erro: unknown) {
  if (erro instanceof SyntaxError) return Response.json({ erro: "JSON inválido." }, { status: 400 });
  if (erro instanceof ZodError) return Response.json({ erro: erro.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  if (erro instanceof GestaoErro) return Response.json({ erro: erro.message }, { status: erro.status });
  if (erro instanceof Prisma.PrismaClientKnownRequestError) {
    if (erro.code === "P2002") return Response.json({ erro: "Já existe um item com esse nome." }, { status: 409 });
    if (erro.code === "P2003" || erro.code === "P2014") return Response.json({ erro: "Item vinculado a outros registros." }, { status: 409 });
    if (erro.code === "P2025") return Response.json({ erro: "Registro não encontrado." }, { status: 404 });
    if (erro.code === "P2021") return Response.json({ erro: "As tabelas da gestão ainda não foram criadas. Execute npm run db:deploy no ambiente do banco." }, { status: 503 });
  }
  console.error("[gestao] erro:", erro);
  return Response.json({ erro: "Não foi possível concluir a operação." }, { status: 500 });
}
export async function GET() {
  if (!await exigirAdmin()) return Response.json({ erro: "Não autorizado." }, { status: 401 });
  try {
    const [materias, produtos, producoes, vendas, despesas] = await Promise.all([
      db.materiaPrima.findMany({ orderBy: { nome: "asc" } }),
      db.produto.findMany({ orderBy: { nome: "asc" }, select: {
        id: true, nome: true, preco: true, fichaTecnica: { select: { materiaPrimaId: true, quantidade: true } },
      } }),
      db.producao.findMany({ orderBy: { criadaEm: "desc" }, take: 500 }),
      db.venda.findMany({ orderBy: { criadaEm: "desc" }, take: 1000 }),
      db.despesa.findMany({ orderBy: { criadaEm: "desc" }, take: 1000 }),
    ]);
    return Response.json(serializar({ materias, produtos, producoes, vendas, despesas }), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (erro) {
    // Permite visualizar o layout antes da aplicação da migração em produção.
    // Nenhum lançamento é simulado nem gravado se as tabelas ainda não existem.
    if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2021") {
      try {
        const lista = await db.produto.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true, preco: true } });
        return Response.json({
          schemaPendente: true, materias: [],
          produtos: lista.map(p => ({ ...p, fichaTecnica: [] })),
          producoes: [], vendas: [], despesas: [],
        }, { headers: { "Cache-Control": "private, no-store" } });
      } catch (erroCatalogo) { return falha(erroCatalogo); }
    }
    return falha(erro);
  }
}
export async function POST(request: Request) {
  if (!await exigirAdmin()) return Response.json({ erro: "Não autorizado." }, { status: 401 });
  try {
    const entrada: unknown = await request.json();
    if (typeof entrada !== "object" || entrada === null || Array.isArray(entrada)) {
      throw new GestaoErro("Dados inválidos.");
    }
    const dados = entrada as { acao?: unknown; payload?: unknown; id?: unknown };
    const { acao, payload } = dados;
    let result: unknown;
    switch (acao) {
      case "estoque.criar": result = await salvarMateriaPrima(payload); break;
      case "estoque.editar": result = await salvarMateriaPrima(payload, idSchema.parse(dados.id)); break;
      case "estoque.excluir": result = await excluirMateriaPrima(idSchema.parse(dados.id)); break;
      case "ficha.salvar": result = await salvarFicha(payload); break;
      case "producao.registrar": result = await registrarProducao(payload); break;
      case "venda.registrar": result = await registrarVenda(payload); break;
      case "despesa.registrar": result = await registrarDespesa(payload); break;
      default: throw new GestaoErro("Operação desconhecida.");
    }
    return Response.json({ ok: true, resultado: result == null ? null : serializar(result as Record<string, unknown>) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (erro) { return falha(erro); }
}
