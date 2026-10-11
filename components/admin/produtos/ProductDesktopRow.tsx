import Link from "next/link";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  productPackagingLabel,
  productPriceLabel,
  productThumbnailUrl,
  type AdminProductListItem,
} from "@/lib/admin/produtos/apresentacao";
import { ProductActions } from "./ProductActions";
import { ProductStatusBadge } from "./ProductStatusBadge";
import { ProductThumbnail } from "./ProductThumbnail";

export function ProductDesktopRow({ product }: { product: AdminProductListItem }) {
  return (
    <TableRow>
      <TableCell>
        <ProductThumbnail url={productThumbnailUrl(product)} compact />
      </TableCell>
      <TableCell className="font-medium">
        <Link href={`/admin/produtos/${product.id}`} className="hover:underline">
          {product.nome}
        </Link>
      </TableCell>
      <TableCell className="text-muted-foreground">{product.categoria.nome}</TableCell>
      <TableCell>
        {product.sobConsulta ? (
          <span className="text-muted-foreground">{productPriceLabel(product)}</span>
        ) : (
          productPriceLabel(product)
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap text-xs">
        {productPackagingLabel(product)}
      </TableCell>
      <TableCell>
        <ProductStatusBadge active={product.ativo} />
      </TableCell>
      <TableCell>
        <ProductActions id={product.id} active={product.ativo} />
      </TableCell>
    </TableRow>
  );
}
