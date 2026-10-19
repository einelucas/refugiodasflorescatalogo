import { SearchX } from "lucide-react";

export function AdminSearchEmptyState({ query }: { query: string }) {
  return (
    <div role="status" className="flex min-h-44 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-primary/15 bg-white/70 px-5 py-8 text-center text-muted-foreground">
      <SearchX aria-hidden="true" className="h-7 w-7 text-primary/40" />
      <p className="text-sm font-medium text-foreground">
        {query ? "Nenhum resultado encontrado" : "Nenhum registro cadastrado"}
      </p>
      {query && <p className="max-w-sm text-xs">Não encontramos registros para “{query}” nesta aba. Tente outra palavra.</p>}
    </div>
  );
}
