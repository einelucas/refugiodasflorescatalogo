import { FooterPagesNav, type PaginaMenu } from "./FooterPagesNav";
import { FooterSocialLinks } from "./FooterSocialLinks";

type SiteFooterProps = {
  whatsappUrl: string;
  paginas: PaginaMenu[];
};

/// Rodapé público: marca e localização, atendimento/redes sociais,
/// páginas institucionais e direitos autorais.
export function SiteFooter({ whatsappUrl, paginas }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-col footer-col-brand">
            <div className="footer-logo-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/imagens/logo-refugio.svg" alt="" loading="lazy" className="footer-flower" />
              <p className="footer-brand">Refúgio das Flores</p>
            </div>
            <p className="footer-tagline-mini">Flores eternas feitas à mão</p>

            <p className="footer-location">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/imagens/location.png" alt="" loading="lazy" className="footer-info-icon" />
              Dourados - MS
            </p>
            <p className="footer-shipping">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/imagens/express-delivery.png" alt="" loading="lazy" className="footer-info-icon" />
              Enviamos para todo o Brasil
            </p>
          </div>

          <FooterSocialLinks whatsappUrl={whatsappUrl} />
          <FooterPagesNav paginas={paginas} />
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© 2026 Refúgio das Flores · Todos os direitos reservados</p>
        </div>
      </div>
    </footer>
  );
}
