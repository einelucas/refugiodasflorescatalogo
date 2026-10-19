import { Fragment } from "react";
import { NAV_ADMIN, itemAtivo } from "./navegacao";
import { AdminTabsNavItem } from "./AdminTabsNavItem";

// Barra secundária inspirada no TabsNav.vue: ícones, painel arredondado,
// rolagem horizontal em telas pequenas e destaque suave para a aba atual.
export function AdminTabsNav({ pathname }: { pathname: string }) {
  return (
    <div className="mx-auto hidden w-full max-w-[1360px] px-3 pt-3 sm:px-5 md:block lg:px-7">
      <nav
        aria-label="Seções do painel administrativo"
        className="flex min-h-[68px] min-w-0 items-center gap-1.5 overflow-x-auto rounded-[18px] border border-primary/10 bg-white px-3 py-2.5 shadow-[0_10px_30px_rgba(84,32,95,0.07)] sm:gap-2 sm:px-4 md:overflow-visible [scrollbar-width:thin]"
      >
        {NAV_ADMIN.map((item) => (
          <Fragment key={item.href}>
            {item.href === "/admin/relatorios" && (
              <span aria-hidden="true" className="mx-1 h-6 w-px shrink-0 bg-primary/10 sm:mx-2" />
            )}
            <AdminTabsNavItem item={item} ativo={itemAtivo(pathname, item.href)} />
          </Fragment>
        ))}
      </nav>
    </div>
  );
}
