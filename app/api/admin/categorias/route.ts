/* /api/admin/categorias — GET e POST. */

import { db } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { codigoPrisma } from "@/lib/erros-prisma";
import { categoriaSchema } from "@/lib/validacao";

export const dynamic = "force-dynamic";

export async function GET() {
  const sessao = await exigirAdmin();
  if (!sessao) return Response.json({ erro: "Não autorizado." }, { status: 401 });

  const categorias = await db.categoria.findMany({
    orderBy: { ordem: "asc" },
    include: { _count: { select: { produtos: true } } },
  });
  return Response.json({ categorias });
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

  const parsed = categoriaSchema.safeParse(corpo);
  if (!parsed.success) {
    return Response.json({ erro: parsed.error.issues[0]?.message }, { status: 400 });
  }

  try {
    const categoria = await db.categoria.create({
      data: {
        ...parsed.data,
        subtitulo: parsed.data.subtitulo ?? null,
        iconeUrl: parsed.data.iconeUrl ?? null,
      },
    });
    return Response.json({ categoria }, { status: 201 });
  } catch (erro) {
    if (codigoPrisma(erro) === "P2002") {
      return Response.json({ erro: "Já existe uma categoria com esse endereço (slug)." }, { status: 400 });
    }
    console.error("[admin/categorias] erro:", erro);
    return Response.json({ erro: "Não foi possível salvar." }, { status: 500 });
  }
}
