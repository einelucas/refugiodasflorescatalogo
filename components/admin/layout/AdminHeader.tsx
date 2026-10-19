"use client";

import Link from "next/link";
import { ExternalLink, Menu } from "lucide-react";
import { SairButton } from "@/components/admin/SairButton";
import { AdminAccentBar, AdminLogo } from "./AdminBrand";
import { ID_MENU_MOBILE } from "./AdminMobileSidebar";
import { AdminSearchField } from "./AdminSearchField";
import { NAV_ADMIN, URL_CATALOGO, itemAtivo } from "./navegacao";

type AdminHeaderProps = {
  pathname: string;
  menuAberto: boolean;
  onAbrirMenu: () => void;
};

// Mesmas proporções e hierarquia do AppHeader da Central, com a identidade do Refúgio.
export function AdminHeader({ pathname, menuAberto, onAbrirMenu }: AdminHeaderProps) {
  const aba = NAV_ADMIN.find((item) => itemAtivo(pathname, item.href));
  // Formulários (ex.: novo produto) não exibem uma pesquisa sem resultados.
  const podeBuscar = NAV_ADMIN.some((item) => item.href === pathname);

  return (
    <header className="relative z-20 border-b border-primary/10 bg-background/95 backdrop-blur" aria-label="Cabeçalho administrativo">
      <AdminAccentBar />
      <div className="mx-auto flex min-h-[64px] w-full max-w-[1440px] items-center gap-3 px-4 sm:px-5 lg:gap-5 lg:px-7">
        <button
          type="button"
          onClick={onAbrirMenu}
          aria-label="Abrir menu do painel"
          aria-expanded={menuAberto}
          aria-controls={ID_MENU_MOBILE}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/10 bg-white text-foreground transition-colors hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:hidden"
        >
          <Menu aria-hidden="true" className="h-5 w-5" />
        </button>

        <Link
          href="/admin/produtos"
          aria-label="Ir para o painel do Refúgio das Flores"
          className="group flex min-w-0 shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <AdminLogo className="h-9 w-9" />
          <span className="hidden min-w-0 leading-tight sm:block">
            <span className="block font-serif text-[15px] font-semibold text-primary sm:text-base">Refúgio das Flores</span>
            <span className="block text-[10px] font-medium tracking-wide text-muted-foreground">Painel de gestão</span>
          </span>
        </Link>

        <div className="hidden shrink-0 border-l border-primary/10 pl-4 xl:block">
          <p className="text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">Administração</p>
          <p className="mt-1 whitespace-nowrap text-sm font-semibold leading-none text-foreground">{aba?.rotulo ?? "Gestão"}</p>
        </div>

        <div className="mx-auto hidden w-full max-w-[430px] min-w-[180px] flex-1 md:block">
          {podeBuscar && <AdminSearchField id="admin-search-desktop" label={aba?.rotulo ?? "esta aba"} />}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <a
            href={URL_CATALOGO}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg border border-primary/15 bg-primary/5 px-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:px-3"
          >
            <ExternalLink aria-hidden="true" className="h-[15px] w-[15px]" />
            <span className="hidden sm:inline">Ver catálogo</span>
            <span className="sm:hidden">Catálogo</span>
          </a>
          <SairButton />
        </div>
      </div>

      {podeBuscar && (
        <div className="border-t border-primary/5 px-4 pb-3 pt-2 md:hidden sm:px-5">
          <AdminSearchField id="admin-search-mobile" label={aba?.rotulo ?? "esta aba"} />
        </div>
      )}
    </header>
  );
}
