/* /api/admin/paginas — as "abas" de conteúdo (Sobre, Entregas, FAQ). */

import { db } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { codigoPrisma } from "@/lib/erros-prisma";
import { paginaSchema } from "@/lib/validacao";

export const dynamic = "force-dynamic";

export async function GET() {
  const sessao = await exigirAdmin();
  if (!sessao) return Response.json({ erro: "Não autorizado." }, { status: 401 });

  const paginas = await db.pagina.findMany({ orderBy: { ordem: "asc" } });
  return Response.json({ paginas });
}

export async function POST(request: Request) {
  const sessao = await exigirAdmin();
  if (!sessao) return Response.json({ erro: "Não autorizado." }, { status: 401 });

  const parsed = paginaSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ erro: parsed.error.issues[0]?.message }, { status: 400 });
  }

  try {
    const pagina = await db.pagina.create({
      data: { ...parsed.data, conteudoHtml: parsed.data.conteudoHtml ?? null },
    });
    return Response.json({ pagina }, { status: 201 });
  } catch (erro) {
    if (codigoPrisma(erro) === "P2002") {
      return Response.json({ erro: "Já existe uma página com esse endereço." }, { status: 400 });
    }
    return Response.json({ erro: "Não foi possível salvar." }, { status: 500 });
  }
}
