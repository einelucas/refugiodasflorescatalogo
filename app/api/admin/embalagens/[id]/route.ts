import { db } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { embalagemSchema } from "@/lib/validacao";
import { serializar } from "@/lib/serializar";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const sessao = await exigirAdmin();
  if (!sessao) return Response.json({ erro: "Não autorizado." }, { status: 401 });

  const { id } = await params;
  const parsed = embalagemSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ erro: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const embalagem = await db.embalagem.update({ where: { id }, data: parsed.data });
  return Response.json({ embalagem: serializar(embalagem) });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const sessao = await exigirAdmin();
  if (!sessao) return Response.json({ erro: "Não autorizado." }, { status: 401 });

  const { id } = await params;
  // Embalagem é só um atalho de digitação; apagar não afeta
  // produtos já cadastrados, que guardam as próprias medidas.
  await db.embalagem.delete({ where: { id } });
  return Response.json({ ok: true });
}
