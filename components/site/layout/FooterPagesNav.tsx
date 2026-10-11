import Link from "next/link";

export type PaginaMenu = { slug: string; titulo: string };

/// Coluna "Páginas": links para as páginas institucionais visíveis no
/// menu. Some quando não há nenhuma.
export function FooterPagesNav({ paginas }: { paginas: PaginaMenu[] }) {
  if (paginas.length === 0) return null;

  return (
    <div className="footer-col">
      <h3 className="footer-col-title">Páginas</h3>
      <nav className="footer-pages" aria-label="Páginas institucionais">
        {paginas.map((pagina) => (
          <Link key={pagina.slug} href={`/p/${pagina.slug}`}>
            {pagina.titulo}
          </Link>
        ))}
      </nav>
    </div>
  );
}
