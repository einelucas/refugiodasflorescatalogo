/* /api/admin/produtos/[id] — GET, PATCH, DELETE. */

import { db } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { produtoSchema } from "@/lib/validacao";
import { serializar } from "@/lib/serializar";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const sessao = await exigirAdmin();
  if (!sessao) return Response.json({ erro: "Não autorizado." }, { status: 401 });

  const { id } = await params;
  const produto = await db.produto.findUnique({
    where: { id },
    include: { imagens: { orderBy: { ordem: "asc" } } },
  });

  if (!produto) return Response.json({ erro: "Produto não encontrado." }, { status: 404 });
  return Response.json({ produto: serializar(produto) });
}

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

  const parsed = produtoSchema.safeParse(corpo);
  if (!parsed.success) {
    return Response.json(
      { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  const { imagens, ...dados } = parsed.data;

  try {
    // Troca o conjunto de imagens em transação: evita o produto
    // ficar sem imagem nenhuma se a segunda operação falhar.
    const produto = await db.$transaction(async (tx: typeof db) => {
      await tx.produtoImagem.deleteMany({ where: { produtoId: id } });
      return tx.produto.update({
        where: { id },
        data: {
          ...dados,
          preco: dados.preco ?? null,
          descricao: dados.descricao ?? null,
          badge: dados.badge ?? null,
          valorDeclarado: dados.valorDeclarado ?? null,
          imagens: {
            create: imagens.map((img, i) => ({
              url: img.url,
              alt: img.alt ?? null,
              ordem: img.ordem ?? i,
            })),
          },
        },
        include: { imagens: true },
      });
    });

    return Response.json({ produto: serializar(produto) });
  } catch (erro) {
    const txt = String(erro);
    if (txt.includes("produtos_dimensoes_minimas")) {
      return Response.json(
        { erro: "Dimensões fora dos limites aceitos pela transportadora." },
        { status: 400 },
      );
    }
    if (txt.includes("produtos_preco_coerente")) {
      return Response.json(
        { erro: 'Informe um preço, ou marque o produto como "sob consulta".' },
        { status: 400 },
      );
    }
    console.error("[admin/produtos] erro ao atualizar:", erro);
    return Response.json({ erro: "Não foi possível atualizar o produto." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const sessao = await exigirAdmin();
  if (!sessao) return Response.json({ erro: "Não autorizado." }, { status: 401 });

  const { id } = await params;

  // Desativar em vez de apagar: preserva histórico e não quebra
  // links já compartilhados no WhatsApp.
  await db.produto.update({ where: { id }, data: { ativo: false } });
  return Response.json({ ok: true });
}
