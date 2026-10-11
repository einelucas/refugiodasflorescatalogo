import Link from "next/link";
import {
  productPackagingLabel,
  productPriceLabel,
  productThumbnailUrl,
  type AdminProductListItem,
} from "@/lib/admin/produtos/apresentacao";
import { ProductActions } from "./ProductActions";
import { ProductStatusBadge } from "./ProductStatusBadge";
import { ProductThumbnail } from "./ProductThumbnail";

export function ProductMobileCard({ product }: { product: AdminProductListItem }) {
  return (
    <article className="rounded-lg border bg-background p-3 shadow-sm">
      <div className="flex min-w-0 gap-3">
        <ProductThumbnail url={productThumbnailUrl(product)} />
        <div className="min-w-0 flex-1">
          <Link
            href={`/admin/produtos/${product.id}`}
            className="block truncate font-medium hover:underline"
          >
            {product.nome}
          </Link>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {product.categoria.nome}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{productPriceLabel(product, true)}</span>
            <ProductStatusBadge active={product.ativo} />
          </div>
        </div>
      </div>
      <div className="mt-3 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        Embalagem: {productPackagingLabel(product)}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <ProductActions id={product.id} active={product.ativo} showEdit />
      </div>
    </article>
  );
}
