import Link from "next/link";
import type { ItemNavegacaoAdmin } from "./navegacao";

type AdminNavItemProps = {
  item: ItemNavegacaoAdmin;
  ativo: boolean;
  /// "desktop": pílula compacta no cabeçalho; "mobile": linha alta no menu lateral.
  variante: "desktop" | "mobile";
};

export function AdminNavItem({ item: { href, rotulo, Icone }, ativo, variante }: AdminNavItemProps) {
  const estado = ativo
    ? "bg-primary/10 font-medium text-primary"
    : "text-muted-foreground hover:bg-accent hover:text-foreground";

  if (variante === "mobile") {
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${estado}`}
      >
        <Icone className="h-5 w-5 shrink-0" />
        {rotulo}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors ${estado}`}
    >
      <Icone className="h-4 w-4" />
      {rotulo}
    </Link>
  );
}
