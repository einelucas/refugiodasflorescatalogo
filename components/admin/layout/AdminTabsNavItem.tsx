import Link from "next/link";
import type { ItemNavegacaoAdmin } from "./navegacao";

// Item único para todas as abas: ícone com balão de nome no hover e no foco
// pelo teclado, sem ficar fixo na aba ativa.
export function AdminTabsNavItem({ item, ativo }: { item: ItemNavegacaoAdmin; ativo: boolean }) {
  const Icone = item.Icone;
  return (
    <div className="group relative flex shrink-0">
      <Link
        href={item.href}
        aria-current={ativo ? "page" : undefined}
        aria-label={item.rotulo}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] border text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 ${
          ativo
            ? "border-primary/15 bg-primary/10 text-primary shadow-[0_2px_8px_rgba(84,32,95,0.08)]"
            : "border-transparent text-muted-foreground hover:border-primary/10 hover:bg-primary/5 hover:text-primary"
        }`}
      >
        <Icone aria-hidden="true" className="h-[20px] w-[20px]" strokeWidth={2} />
        <span className="sr-only">{item.rotulo}</span>
      </Link>

      {/* Balão com o nome da aba. O aria-label acima já anuncia o item,
          então o balão é apenas visual. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 -translate-y-1 whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
      >
        {item.rotulo}
        <span
          aria-hidden="true"
          className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 rounded-[1px] bg-slate-800"
        />
      </span>
    </div>
  );
}
