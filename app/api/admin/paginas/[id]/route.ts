import { db } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { codigoPrisma } from "@/lib/erros-prisma";
import { sanitizarHtmlInstitucional } from "@/lib/sanitizar-html";
import { paginaSchema } from "@/lib/validacao";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const sessao = await exigirAdmin();
  if (!sessao) return Response.json({ erro: "Não autorizado." }, { status: 401 });

  const { id } = await params;
  const parsed = paginaSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ erro: parsed.error.issues[0]?.message }, { status: 400 });
  }

  try {
    const conteudoHtml = parsed.data.conteudoHtml
      ? sanitizarHtmlInstitucional(parsed.data.conteudoHtml)
      : null;
    const pagina = await db.pagina.update({
      where: { id },
      data: { ...parsed.data, conteudoHtml },
    });
    return Response.json({ pagina });
  } catch (erro) {
    if (codigoPrisma(erro) === "P2002") {
      return Response.json({ erro: "Já existe uma página com esse endereço." }, { status: 400 });
    }
    if (codigoPrisma(erro) === "P2025") {
      return Response.json({ erro: "Página não encontrada." }, { status: 404 });
    }
    return Response.json({ erro: "Não foi possível salvar." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const sessao = await exigirAdmin();
  if (!sessao) return Response.json({ erro: "Não autorizado." }, { status: 401 });

  const { id } = await params;
  try {
    await db.pagina.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (erro) {
    if (codigoPrisma(erro) === "P2025") {
      return Response.json({ erro: "Página não encontrada." }, { status: 404 });
    }
    return Response.json({ erro: "Não foi possível excluir." }, { status: 500 });
  }
}
