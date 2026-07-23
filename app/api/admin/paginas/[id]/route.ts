import { db } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
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

  const pagina = await db.pagina.update({
    where: { id },
    data: { ...parsed.data, conteudoHtml: parsed.data.conteudoHtml ?? null },
  });
  return Response.json({ pagina });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const sessao = await exigirAdmin();
  if (!sessao) return Response.json({ erro: "Não autorizado." }, { status: 401 });

  const { id } = await params;
  await db.pagina.delete({ where: { id } });
  return Response.json({ ok: true });
}
