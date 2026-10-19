"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";
import { AdminMobileSidebar } from "@/components/admin/layout/AdminMobileSidebar";
import { AdminTabsNav } from "@/components/admin/layout/AdminTabsNav";
import { AdminSearchProvider } from "@/components/admin/layout/AdminSearchContext";

// Layout compartilhado por todas as rotas /admin, exceto login.
// O key reinicia a pesquisa a cada troca de página e evita filtros residuais.
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);
  const abrirMenu = useCallback(() => setMenuAberto(true), []);
  const fecharMenu = useCallback(() => setMenuAberto(false), []);

  // Fecha a sidebar ao trocar de aba (inclusive pelo botão voltar).
  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <AdminSearchProvider key={pathname}>
      <div className="admin-shell min-h-dvh min-w-0 bg-[#fbf8fb]">
        <AdminHeader pathname={pathname} menuAberto={menuAberto} onAbrirMenu={abrirMenu} />
        <AdminTabsNav pathname={pathname} />
        <AdminMobileSidebar pathname={pathname} aberto={menuAberto} onFechar={fecharMenu} />
        <main className="admin-content mx-auto w-full min-w-0 max-w-[1360px] px-4 pb-10 pt-6 sm:px-5 lg:px-7 lg:pt-8">
          {children}
        </main>
      </div>
    </AdminSearchProvider>
  );
}
