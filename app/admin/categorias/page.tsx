import { db } from "@/lib/db";
import { GerenciarCategorias } from "@/components/admin/GerenciarCategorias";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  const categorias = await db.categoria.findMany({
    orderBy: { ordem: "asc" },
    include: { _count: { select: { produtos: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl">Categorias</h1>
        <p className="text-sm text-muted-foreground">As abas que aparecem no catálogo do site.</p>
      </div>
      <GerenciarCategorias iniciais={categorias.map((c) => ({
        id: c.id,
        nome: c.nome,
        slug: c.slug,
        titulo: c.titulo,
        subtitulo: c.subtitulo,
        aliases: c.aliases,
        iconeUrl: c.iconeUrl,
        ordem: c.ordem,
        ativa: c.ativa,
        totalProdutos: c._count.produtos,
      }))} />
    </div>
  );
}
