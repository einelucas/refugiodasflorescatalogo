import Link from "next/link";
import { ExternalLink, Menu } from "lucide-react";
import { AdminAccentBar, AdminLogo } from "./AdminBrand";
import { URL_CATALOGO } from "./navegacao";

type AdminMobileHeaderProps = {
  menuAberto: boolean;
  onAbrirMenu: () => void;
};

/// Barra fixa do painel abaixo de md: botão do menu, marca e catálogo.
export function AdminMobileHeader({ menuAberto, onAbrirMenu }: AdminMobileHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur md:hidden">
      <AdminAccentBar />
      <div className="flex h-14 items-center justify-between gap-3 px-3 sm:px-4">
        <button
          type="button"
          onClick={onAbrirMenu}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border bg-background text-foreground transition-colors hover:bg-accent"
          aria-label="Abrir menu do painel"
          aria-expanded={menuAberto}
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link
          href="/admin/produtos"
          className="flex min-w-0 items-center gap-2 font-serif text-base font-medium"
        >
          <AdminLogo />
          <span className="truncate">Refúgio das Flores</span>
        </Link>

        <a
          href={URL_CATALOGO}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border bg-background text-foreground transition-colors hover:bg-accent"
          aria-label="Abrir catálogo em uma nova aba"
        >
          <ExternalLink className="h-5 w-5" />
        </a>
      </div>
    </header>
  );
}
