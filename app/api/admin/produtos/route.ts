/* /api/admin/produtos — GET (listar) e POST (criar). */

import { db } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { codigoPrisma } from "@/lib/erros-prisma";
import { produtoSchema } from "@/lib/validacao";
import { serializarLista, serializar } from "@/lib/serializar";

export const dynamic = "force-dynamic";

export async function GET() {
  const sessao = await exigirAdmin();
  if (!sessao) return Response.json({ erro: "Não autorizado." }, { status: 401 });

  const produtos = await db.produto.findMany({
    orderBy: [{ categoria: { ordem: "asc" } }, { ordem: "asc" }],
    include: {
      categoria: { select: { id: true, nome: true } },
      imagens: { orderBy: { ordem: "asc" } },
    },
  });

  return Response.json({ produtos: serializarLista(produtos) });
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

  const parsed = produtoSchema.safeParse(corpo);
  if (!parsed.success) {
    return Response.json(
      { erro: parsed.error.issues[0]?.message ?? "Dados inválidos.", detalhes: parsed.error.issues },
      { status: 400 },
    );
  }

  const { imagens, ...dados } = parsed.data;

  try {
    const produto = await db.produto.create({
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

    return Response.json({ produto: serializar(produto) }, { status: 201 });
  } catch (erro) {
    if (codigoPrisma(erro) === "P2003") {
      return Response.json({ erro: "Categoria inexistente." }, { status: 400 });
    }
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
    console.error("[admin/produtos] erro ao criar:", erro);
    return Response.json({ erro: "Não foi possível salvar o produto." }, { status: 500 });
  }
}
