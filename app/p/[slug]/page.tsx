import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { sanitizarHtmlInstitucional } from "@/lib/sanitizar-html";

export const revalidate = 300;

export default async function PaginaConteudo({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pagina = await db.pagina.findUnique({ where: { slug } });
  if (!pagina) notFound();

  return (
    <article className="content-page">
      <h1>{pagina.titulo}</h1>
      {pagina.conteudoHtml && (
        <div
          className="content-page-body"
          dangerouslySetInnerHTML={{
            __html: sanitizarHtmlInstitucional(pagina.conteudoHtml),
          }}
        />
      )}
    </article>
  );
}
