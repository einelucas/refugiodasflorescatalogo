"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SairButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      title="Encerrar sessão"
      className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:px-3"
    >
      <LogOut aria-hidden="true" className="h-[16px] w-[16px]" />
      Sair
    </button>
  );
}
