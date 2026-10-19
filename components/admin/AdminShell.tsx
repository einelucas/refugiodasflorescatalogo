"use client";

import { usePathname } from "next/navigation";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";
import { AdminTabsNav } from "@/components/admin/layout/AdminTabsNav";
import { AdminSearchProvider } from "@/components/admin/layout/AdminSearchContext";

// Layout compartilhado por todas as rotas /admin, exceto login.
// O key reinicia a pesquisa a cada troca de página e evita filtros residuais.
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <AdminSearchProvider key={pathname}>
      <div className="admin-shell min-h-dvh min-w-0 bg-[#fbf8fb]">
        <AdminHeader pathname={pathname} />
        <AdminTabsNav pathname={pathname} />
        <main className="admin-content mx-auto w-full min-w-0 max-w-[1360px] px-3 pb-10 pt-6 sm:px-5 lg:px-7 lg:pt-8">
          {children}
        </main>
      </div>
    </AdminSearchProvider>
  );
}
