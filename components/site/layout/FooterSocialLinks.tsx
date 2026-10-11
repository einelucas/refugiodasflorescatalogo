import { WhatsAppIcon } from "../WhatsAppIcon";

/// Coluna "Atendimento": WhatsApp da loja e redes sociais.
export function FooterSocialLinks({ whatsappUrl }: { whatsappUrl: string }) {
  return (
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
  );
}
