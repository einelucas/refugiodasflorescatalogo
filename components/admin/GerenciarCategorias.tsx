import { CategoryManager } from "@/components/admin/categorias/CategoryManager";
import type { CategoriaAdmin } from "@/types";

export function GerenciarCategorias({ iniciais }: { iniciais: CategoriaAdmin[] }) {
  return <CategoryManager categories={iniciais} />;
}
