/* =========================================================
   GET /api/catalogo — rota pública.

   Retorna apenas o necessário para renderizar o catálogo.
   NÃO retorna peso, dimensões nem valorDeclarado: não são
   segredo, mas expor estrutura interna sem necessidade só
   amplia superfície de ataque. O frete é calculado no
   servidor a partir do id.
   ========================================================= */

import { db } from "@/lib/db";

export const revalidate = 60;

export async function GET() {
  try {
    const categorias = await db.categoria.findMany({
      where: { ativa: true },
      orderBy: { ordem: "asc" },
      select: {
        id: true,
        nome: true,
        slug: true,
        titulo: true,
        subtitulo: true,
        aliases: true,
        iconeUrl: true,
        produtos: {
          where: { ativo: true },
          orderBy: { ordem: "asc" },
          select: {
            id: true,
            nome: true,
            descricao: true,
            preco: true,
            sobConsulta: true,
            badge: true,
            freteHabilitado: true,
            imagens: { orderBy: { ordem: "asc" }, select: { url: true, alt: true } },
          },
        },
      },
    });

    const payload = categorias.map((c) => ({
      id: c.id,
      nome: c.nome,
      slug: c.slug,
      titulo: c.titulo,
      subtitulo: c.subtitulo,
      aliases: c.aliases,
      iconeUrl: c.iconeUrl,
      produtos: c.produtos.map((p) => ({
        id: p.id,
        nome: p.nome,
        descricao: p.descricao,
        // Decimal → Number na fronteira JSON, sempre.
        preco: p.preco === null ? null : Number(p.preco),
        sobConsulta: p.sobConsulta,
        badge: p.badge || "",
        freteHabilitado: p.freteHabilitado,
        imagens: p.imagens.map((i) => ({ url: i.url, alt: i.alt ?? p.nome })),
      })),
    }));

    return Response.json(
      { categorias: payload },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (erro) {
    console.error("[catalogo] erro:", erro);
    return Response.json({ erro: "Não foi possível carregar o catálogo." }, { status: 500 });
  }
}
