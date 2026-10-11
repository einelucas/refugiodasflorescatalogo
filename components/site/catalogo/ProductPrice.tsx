import { formatarBRL, formatarParcelamento } from "@/lib/utils";

type ProductPriceProps = {
  price: number | null;
  onRequest: boolean;
  variant?: "card" | "modal";
};

export function ProductPrice({ price, onRequest, variant = "card" }: ProductPriceProps) {
  const prefix = variant === "modal" ? "modal" : "card";

  return (
    <div className={`${prefix}-price`}>
      {onRequest || price === null ? (
        "A consultar"
      ) : (
        <>
          <span className={`${prefix}-price-pix`}>{formatarBRL(price)} no Pix</span>
          <span className={`${prefix}-price-parcelas`}>{formatarParcelamento(price)}</span>
        </>
      )}
    </div>
  );
}
