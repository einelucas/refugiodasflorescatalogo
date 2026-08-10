import Link from "next/link";
import { CarrinhoBotao } from "./CarrinhoBotao";

// Barra fixa e sempre visível — sem o antigo mecanismo de encolher
// no scroll. Além de mais previsível, deixa espaço reservado à
// direita pro ícone do carrinho (com contador).
export function SiteHeader() {
  return (
    <header className="site-header-bar">
      <div className="site-header-bar-inner">
        <Link href="/" className="site-header-brand" aria-label="Ir para o início">
          <span className="site-header-logo-ring">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/imagens/logo-refugio.svg" alt="" className="site-header-logo-svg" />
          </span>
          <span className="site-header-wordmark">Refúgio das Flores</span>
        </Link>
        <CarrinhoBotao />
      </div>
    </header>
  );
}
