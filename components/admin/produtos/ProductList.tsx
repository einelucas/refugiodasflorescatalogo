"use client";

import { useAdminSearch } from "@/components/admin/layout/AdminSearchContext";
import { correspondeBusca } from "@/lib/admin/busca";
import { AdminSearchEmptyState } from "@/components/admin/layout/AdminSearchEmptyState";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminProductListItem } from "@/lib/admin/produtos/apresentacao";
import { ProductDesktopRow } from "./ProductDesktopRow";
import { ProductMobileCard } from "./ProductMobileCard";

export function ProductList({ products }: { products: AdminProductListItem[] }) {
  const { query } = useAdminSearch();
  const filtrados = products.filter((produto) => correspondeBusca(query, produto.nome, produto.categoria.nome, produto.ativo ? "ativo" : "inativo", produto.sobConsulta ? "sob consulta" : produto.preco == null ? "" : Number(produto.preco).toFixed(2)));
  if (filtrados.length === 0) return <AdminSearchEmptyState query={query} />;

  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filtrados.map((product) => (
          <ProductMobileCard key={product.id} product={product} />
        ))}
      </div>
      <div className="hidden max-w-full overflow-hidden rounded-lg border bg-background md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14" />
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Embalagem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.map((product) => (
              <ProductDesktopRow key={product.id} product={product} />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
