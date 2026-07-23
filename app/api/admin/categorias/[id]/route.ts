/* /api/admin/categorias/[id] — PATCH e DELETE. */

import { db } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { codigoPrisma } from "@/lib/erros-prisma";
import { categoriaSchema } from "@/lib/validacao";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const sessao = await exigirAdmin();
  if (!sessao) return Response.json({ erro: "Não autorizado." }, { status: 401 });

  const { id } = await params;

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
    const categoria = await db.categoria.update({
      where: { id },
      data: {
        ...parsed.data,
        subtitulo: parsed.data.subtitulo ?? null,
        iconeUrl: parsed.data.iconeUrl ?? null,
      },
    });
    return Response.json({ categoria });
  } catch (erro) {
    if (codigoPrisma(erro) === "P2002") {
      return Response.json({ erro: "Já existe uma categoria com esse endereço (slug)." }, { status: 400 });
    }
    console.error("[admin/categorias] erro:", erro);
    return Response.json({ erro: "Não foi possível atualizar." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const sessao = await exigirAdmin();
  if (!sessao) return Response.json({ erro: "Não autorizado." }, { status: 401 });

  const { id } = await params;

  // A relação é onDelete: Restrict — apagar uma categoria com
  // produtos deixaria produtos órfãos. Desativar é o correto:
  // eles somem do site sem sumir do banco.
  const comProdutos = await db.produto.count({ where: { categoriaId: id, ativo: true } });
  if (comProdutos > 0) {
    return Response.json(
      {
        erro: `Esta categoria tem ${comProdutos} produto(s) ativo(s). Mova-os ou desative-os antes.`,
      },
      { status: 400 },
    );
  }

  await db.categoria.update({ where: { id }, data: { ativa: false } });
  return Response.json({ ok: true });
}
