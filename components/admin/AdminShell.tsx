"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  ExternalLink,
  FileText,
  FolderTree,
  Menu,
  Package,
  X,
} from "lucide-react";

import { SairButton } from "@/components/admin/SairButton";

const NAV = [
  { href: "/admin/produtos", rotulo: "Produtos", Icone: Package },
  { href: "/admin/categorias", rotulo: "Categorias", Icone: FolderTree },
  { href: "/admin/paginas", rotulo: "Páginas", Icone: FileText },
  { href: "/admin/embalagens", rotulo: "Embalagens", Icone: Box },
];

const URL_CATALOGO = "https://refugiodasflorescatalogo.vercel.app";

function LogoMarca({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#54205f] to-[#76367f] shadow-sm shadow-primary/20 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/imagens/logo-refugio.svg" alt="" className="h-full w-full" />
    </span>
  );
}

function itemAtivo(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuAberto) return;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflowAnterior;
    };
  }, [menuAberto]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="admin-shell min-h-dvh min-w-0 bg-muted/30">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur md:hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#54205f] via-[#76367f] to-[#d97ca8]" />
        <div className="flex h-14 items-center justify-between gap-3 px-3 sm:px-4">
          <button
            type="button"
            onClick={() => setMenuAberto(true)}
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
            <LogoMarca />
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

      <header className="hidden border-b bg-background md:block">
        <div className="h-[3px] bg-gradient-to-r from-[#54205f] via-[#76367f] to-[#d97ca8]" />
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-5 px-4 lg:px-6">
          <Link
            href="/admin/produtos"
            className="flex shrink-0 items-center gap-2 font-serif text-lg text-primary"
          >
            <LogoMarca />
            Refúgio
          </Link>

          <nav className="flex min-w-0 flex-1 items-center gap-1" aria-label="Navegação do painel">
            {NAV.map(({ href, rotulo, Icone }) => {
              const ativo = itemAtivo(pathname, href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                    ativo
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icone className="h-4 w-4" />
                  {rotulo}
                </Link>
              );
            })}
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

      {menuAberto && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            onClick={() => setMenuAberto(false)}
            aria-label="Fechar menu do painel"
          />

          <aside className="absolute inset-y-0 left-0 flex w-[min(86vw,320px)] flex-col border-r bg-background p-4 shadow-xl">
            <div className="flex items-center justify-between gap-3 border-b pb-4">
              <Link
                href="/admin/produtos"
                className="flex min-w-0 items-center gap-2 font-serif text-lg"
              >
                <LogoMarca />
                <span className="truncate">Refúgio das Flores</span>
              </Link>

              <button
                type="button"
                onClick={() => setMenuAberto(false)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md hover:bg-accent"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 py-4" aria-label="Navegação móvel do painel">
              {NAV.map(({ href, rotulo, Icone }) => {
                const ativo = itemAtivo(pathname, href);

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${
                      ativo
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <Icone className="h-5 w-5 shrink-0" />
                    {rotulo}
                  </Link>
                );
              })}
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
      )}

      <main className="admin-content mx-auto w-full min-w-0 max-w-7xl px-3 py-5 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
        {children}
      </main>
    </div>
  );
}
