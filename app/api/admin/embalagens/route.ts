/* /api/admin/embalagens — modelos de caixa salvos.
   A cliente cadastra "Buquê médio — 40×20×20" uma vez e depois
   seleciona num dropdown, em vez de redigitar a cada produto. */

import { db } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { embalagemSchema } from "@/lib/validacao";
import { serializarLista, serializar } from "@/lib/serializar";

export const dynamic = "force-dynamic";

export async function GET() {
  const sessao = await exigirAdmin();
  if (!sessao) return Response.json({ erro: "Não autorizado." }, { status: 401 });

  const embalagens = await db.embalagem.findMany({ orderBy: { nome: "asc" } });
  return Response.json({ embalagens: serializarLista(embalagens) });
}

export async function POST(request: Request) {
  const sessao = await exigirAdmin();
  if (!sessao) return Response.json({ erro: "Não autorizado." }, { status: 401 });

  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    return Response.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  const parsed = embalagemSchema.safeParse(corpo);
  if (!parsed.success) {
    return Response.json({ erro: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const embalagem = await db.embalagem.create({ data: parsed.data });
  return Response.json({ embalagem: serializar(embalagem) }, { status: 201 });
}
