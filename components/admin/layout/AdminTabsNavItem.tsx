import Link from "next/link";
import type { ItemNavegacaoAdmin } from "./navegacao";

// Item único para todas as abas, com tooltip nativo acessível ao teclado.
export function AdminTabsNavItem({ item, ativo }: { item: ItemNavegacaoAdmin; ativo: boolean }) {
  const Icone = item.Icone;
  return (
    <Link
      href={item.href}
      aria-current={ativo ? "page" : undefined}
      aria-label={item.rotulo}
      title={item.rotulo}
      className={`group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] border text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 ${
        ativo
          ? "border-primary/15 bg-primary/10 text-primary shadow-[0_2px_8px_rgba(84,32,95,0.08)]"
          : "border-transparent text-muted-foreground hover:border-primary/10 hover:bg-primary/5 hover:text-primary"
      }`}
    >
      <Icone aria-hidden="true" className="h-[20px] w-[20px]" strokeWidth={2} />
      <span className="sr-only">{item.rotulo}</span>
    </Link>
  );
}
