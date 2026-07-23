import { db } from "@/lib/db";
import { GerenciarPaginas } from "@/components/admin/GerenciarPaginas";

export const dynamic = "force-dynamic";

export default async function PaginasPage() {
  const paginas = await db.pagina.findMany({ orderBy: { ordem: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl">Páginas</h1>
        <p className="text-sm text-muted-foreground">
          Conteúdos como Sobre, Entregas e Perguntas frequentes.
        </p>
      </div>
      <GerenciarPaginas iniciais={paginas} />
    </div>
  );
}
