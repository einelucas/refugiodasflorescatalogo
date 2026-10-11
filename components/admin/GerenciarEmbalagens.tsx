import { PackagingManager } from "@/components/admin/embalagens/PackagingManager";
import type { Embalagem } from "@/types";

export function GerenciarEmbalagens({ iniciais }: { iniciais: Embalagem[] }) {
  return <PackagingManager packages={iniciais} />;
}
