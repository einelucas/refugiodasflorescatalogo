import Link from "next/link";
import { ExternalLink, X } from "lucide-react";
import { SairButton } from "@/components/admin/SairButton";
import { AdminLogo } from "./AdminBrand";
import { AdminNavItem } from "./AdminNavItem";
import { NAV_ADMIN, URL_CATALOGO, itemAtivo } from "./navegacao";

type AdminMobileMenuProps = {
  pathname: string;
  onFechar: () => void;
};

/// Menu lateral do painel abaixo de md. Fecha pelo fundo escurecido ou
/// pelo X; quem controla a abertura (e o bloqueio de scroll) é o AdminShell.
export function AdminMobileMenu({ pathname, onFechar }: AdminMobileMenuProps) {
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        onClick={onFechar}
        aria-label="Fechar menu do painel"
      />

      <aside className="absolute inset-y-0 left-0 flex w-[min(86vw,320px)] flex-col border-r bg-background p-4 shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b pb-4">
          <Link href="/admin/produtos" className="flex min-w-0 items-center gap-2 font-serif text-lg">
            <AdminLogo />
            <span className="truncate">Refúgio das Flores</span>
          </Link>

          <button
            type="button"
            onClick={onFechar}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md hover:bg-accent"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 py-4" aria-label="Navegação móvel do painel">
          {NAV_ADMIN.map((item) => (
            <AdminNavItem
              key={item.href}
              item={item}
              ativo={itemAtivo(pathname, item.href)}
              variante="mobile"
            />
          ))}
        </nav>

        <div className="space-y-2 border-t pt-4">
          <a
            href={URL_CATALOGO}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-primary transition-colors hover:bg-accent"
          >
            <ExternalLink className="h-5 w-5 shrink-0" />
            Ver catálogo
          </a>
          <SairButton />
        </div>
      </aside>
    </div>
  );
}
