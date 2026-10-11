import { normalizarTexto } from "@/lib/texto";

type ProductBadgeProps = {
  badge: string | null;
  variant?: "card" | "modal";
};

function badgeClassName(badge: string) {
  const value = normalizarTexto(badge).replace(/\s+/g, "-");
  if (value.includes("mais-vendido")) return "badge-mais-vendido";
  if (value.includes("novo")) return "badge-novo";
  if (value.includes("promocao")) return "badge-promocao";
  return "";
}

export function ProductBadge({ badge, variant = "card" }: ProductBadgeProps) {
  if (!badge) return null;

  return (
    <span
      className={`${variant === "modal" ? "modal-badge" : "badge"} ${badgeClassName(badge)}`}
    >
      {badge}
    </span>
  );
}
