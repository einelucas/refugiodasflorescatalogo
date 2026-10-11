import { PageManager } from "@/components/admin/paginas/PageManager";
import type { Pagina } from "@/types";

export function GerenciarPaginas({ iniciais }: { iniciais: Pagina[] }) {
  return <PageManager pages={iniciais} />;
}
