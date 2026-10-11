"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LIMITES } from "@/config/frete";
import { resumoDimensoes } from "@/lib/admin/produto/formulario";
import type { ProdutoForm } from "@/types";

type ProductDimensionsSectionProps = {
  product: ProdutoForm;
  onFieldChange: <K extends keyof ProdutoForm>(field: K, value: ProdutoForm[K]) => void;
};

export function ProductDimensionsSection({
  product,
  onFieldChange,
}: ProductDimensionsSectionProps) {
  const { soma, somaExcedida } = resumoDimensoes(product);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="peso">Peso (kg)</Label>
          <Input
            id="peso"
            type="number"
            step="0.001"
            value={product.pesoKg || ""}
            onChange={(event) => onFieldChange("pesoKg", Number(event.target.value))}
          />
          <p className="text-xs text-muted-foreground">máx. {LIMITES.pesoMaxKg}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="altura">Altura (cm)</Label>
          <Input
            id="altura"
            type="number"
            step="0.1"
            value={product.alturaCm || ""}
            onChange={(event) => onFieldChange("alturaCm", Number(event.target.value))}
          />
          <p className="text-xs text-muted-foreground">mín. {LIMITES.alturaMin}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="largura">Largura (cm)</Label>
          <Input
            id="largura"
            type="number"
            step="0.1"
            value={product.larguraCm || ""}
            onChange={(event) => onFieldChange("larguraCm", Number(event.target.value))}
          />
          <p className="text-xs text-muted-foreground">mín. {LIMITES.larguraMin}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="comprimento">Comprimento (cm)</Label>
          <Input
            id="comprimento"
            type="number"
            step="0.1"
            value={product.comprimentoCm || ""}
            onChange={(event) =>
              onFieldChange("comprimentoCm", Number(event.target.value))
            }
          />
          <p className="text-xs text-muted-foreground">mín. {LIMITES.comprimentoMin}</p>
        </div>
      </div>

      <p className={`text-sm ${somaExcedida ? "text-destructive" : "text-muted-foreground"}`}>
        Soma das dimensões: {soma.toFixed(1)} cm
        {somaExcedida && ` — acima do limite de ${LIMITES.somaMax} cm`}
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="declarado">
          Valor declarado (R$){" "}
          <span className="font-normal text-muted-foreground">— vazio usa o preço</span>
        </Label>
        <Input
          id="declarado"
          type="number"
          step="0.01"
          value={product.valorDeclarado ?? ""}
          onChange={(event) =>
            onFieldChange(
              "valorDeclarado",
              event.target.value === "" ? null : Number(event.target.value),
            )
          }
        />
      </div>

      <label className="flex items-start gap-3">
        <Switch
          checked={product.freteHabilitado}
          onCheckedChange={(value) => onFieldChange("freteHabilitado", value)}
          disabled={product.sobConsulta}
        />
        <span className="text-sm">
          Calcular frete para este produto
          <span className="block text-xs text-muted-foreground">
            Desmarque para itens de retirada ou entrega local.
          </span>
        </span>
      </label>
    </>
  );
}
