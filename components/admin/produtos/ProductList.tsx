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
  return (
    <>
      <div className="grid gap-3 md:hidden">
        {products.map((product) => (
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
            {products.map((product) => (
              <ProductDesktopRow key={product.id} product={product} />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
