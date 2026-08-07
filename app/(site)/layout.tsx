import Link from "next/link";
import { db } from "@/lib/db";
import { SiteHeader } from "@/components/site/SiteHeader";

export const revalidate = 300;

const WHATSAPP_MESSAGE = encodeURIComponent(
  "Olá, vim pelo catálogo e gostaria de mais informações!",
);

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [paginas, config] = await Promise.all([
    db.pagina.findMany({
      where: { visivelNoMenu: true },
      orderBy: { ordem: "asc" },
      select: { slug: true, titulo: true },
    }),
    db.configuracao.findUnique({ where: { chave: "whatsappLoja" } }),
  ]);

  const whatsapp = (config?.valor as string) ?? process.env.WHATSAPP_LOJA ?? "556796072932";
  const whatsappUrl = `https://wa.me/${whatsapp}?text=${WHATSAPP_MESSAGE}`;

  return (
    <div className="public-site">
      <SiteHeader />

      {children}

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-col footer-col-brand">
              <div className="footer-logo-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/imagens/logo-refugio.svg" alt="" className="footer-flower" />
                <p className="footer-brand">Refúgio das Flores</p>
              </div>
              <p className="footer-tagline-mini">Flores eternas feitas à mão</p>

              <p className="footer-location">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/imagens/location.png" alt="" className="footer-info-icon" />
                Dourados - MS
              </p>
              <p className="footer-shipping">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/imagens/express-delivery.png" alt="" className="footer-info-icon" />
                Enviamos para todo o Brasil
              </p>
            </div>

            <div className="footer-col">
              <h3 className="footer-col-title">Atendimento</h3>
              <div className="footer-socials">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link social-link--whatsapp"
                >
                  <WhatsAppIcon />
                  WhatsApp
                </a>
                <a
                  href="https://www.instagram.com/_refugiodasflores_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                  @_refugiodasflores_
                </a>
                <a
                  href="https://www.tiktok.com/@refugio.das.flores"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                  </svg>
                  @refugio.das.flores
                </a>
              </div>
            </div>

            {paginas.length > 0 && (
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
            )}
          </div>

          <div className="footer-bottom">
            <p className="footer-copy">© 2026 Refúgio das Flores · Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
