"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { AdminLogo } from "./AdminBrand";
import { NAV_ADMIN, itemAtivo } from "./navegacao";

export const ID_MENU_MOBILE = "admin-menu-mobile";

type AdminMobileSidebarProps = {
  pathname: string;
  aberto: boolean;
  onFechar: () => void;
};

// Navegação lateral abaixo de md. Substitui a barra de abas no mobile:
// fecha pelo fundo escurecido, pelo X, pelo Esc ou ao escolher uma aba.
export function AdminMobileSidebar({ pathname, aberto, onFechar }: AdminMobileSidebarProps) {
  const fecharRef = useRef<HTMLButtonElement>(null);
  const gatilhoRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!aberto) return;

    gatilhoRef.current = document.activeElement as HTMLElement | null;
    fecharRef.current?.focus();

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function aoTeclar(event: KeyboardEvent) {
      if (event.key === "Escape") onFechar();
    }

    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = overflowAnterior;
      gatilhoRef.current?.focus();
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        aria-hidden="true"
        onClick={onFechar}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
      />

      <aside
        id={ID_MENU_MOBILE}
        role="dialog"
        aria-modal="true"
        aria-label="Menu do painel administrativo"
        className="absolute inset-y-0 left-0 flex w-[min(86vw,320px)] flex-col border-r border-primary/10 bg-white shadow-2xl animate-in slide-in-from-left duration-200"
      >
        <div className="flex items-center justify-between gap-3 border-b border-primary/10 px-4 py-4">
          <Link
            href="/admin/produtos"
            onClick={onFechar}
            aria-label="Ir para o painel do Refúgio das Flores"
            className="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <AdminLogo className="h-9 w-9" />
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-serif text-[15px] font-semibold text-primary">
                Refúgio das Flores
              </span>
              <span className="block text-[10px] font-medium tracking-wide text-muted-foreground">
                Painel de gestão
              </span>
            </span>
          </Link>

          <button
            ref={fecharRef}
            type="button"
            onClick={onFechar}
            aria-label="Fechar menu"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <nav
          aria-label="Seções do painel administrativo"
          className="flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-3 py-4"
        >
          {NAV_ADMIN.map((item) => {
            const ativo = itemAtivo(pathname, item.href);
            const Icone = item.Icone;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onFechar}
                aria-current={ativo ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  ativo
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                }`}
              >
                <Icone aria-hidden="true" className="h-5 w-5 shrink-0" strokeWidth={2} />
                {item.rotulo}
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
