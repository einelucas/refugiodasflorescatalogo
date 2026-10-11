import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { SairButton } from "@/components/admin/SairButton";
import { AdminAccentBar, AdminLogo } from "./AdminBrand";
import { AdminNavItem } from "./AdminNavItem";
import { NAV_ADMIN, URL_CATALOGO, itemAtivo } from "./navegacao";

/// Cabeçalho do painel a partir de md: marca, links, catálogo e sair.
export function AdminDesktopHeader({ pathname }: { pathname: string }) {
  return (
    <header className="hidden border-b bg-background md:block">
      <AdminAccentBar />
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-5 px-4 lg:px-6">
        <Link
          href="/admin/produtos"
          className="flex shrink-0 items-center gap-2 font-serif text-lg text-primary"
        >
          <AdminLogo />
          Refúgio
        </Link>

        <nav className="flex min-w-0 flex-1 items-center gap-1" aria-label="Navegação do painel">
          {NAV_ADMIN.map((item) => (
            <AdminNavItem
              key={item.href}
              item={item}
              ativo={itemAtivo(pathname, item.href)}
              variante="desktop"
            />
          ))}
        </nav>

        <a
          href={URL_CATALOGO}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1.5 rounded-md border border-primary/20 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
        >
          <ExternalLink className="h-4 w-4" />
          Ver catálogo
        </a>

        <SairButton />
      </div>
    </header>
  );
}
