"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminDesktopHeader } from "@/components/admin/layout/AdminDesktopHeader";
import { AdminMobileHeader } from "@/components/admin/layout/AdminMobileHeader";
import { AdminMobileMenu } from "@/components/admin/layout/AdminMobileMenu";

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
      <AdminMobileHeader menuAberto={menuAberto} onAbrirMenu={() => setMenuAberto(true)} />
      <AdminDesktopHeader pathname={pathname} />

      {menuAberto && <AdminMobileMenu pathname={pathname} onFechar={() => setMenuAberto(false)} />}

      <main className="admin-content mx-auto w-full min-w-0 max-w-7xl px-3 py-5 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
        {children}
      </main>
    </div>
  );
}
