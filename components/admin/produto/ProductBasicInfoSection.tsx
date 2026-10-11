"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { CategoriaOpcao, ProdutoForm } from "@/types";

type ProductBasicInfoSectionProps = {
  product: ProdutoForm;
  categories: CategoriaOpcao[];
  onFieldChange: <K extends keyof ProdutoForm>(field: K, value: ProdutoForm[K]) => void;
  children?: ReactNode;
};

export function ProductBasicInfoSection({
  product,
  categories,
  onFieldChange,
  children,
}: ProductBasicInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados do produto</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            value={product.nome}
            onChange={(event) => onFieldChange("nome", event.target.value)}
            maxLength={120}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Categoria</Label>
          <Select
            value={product.categoriaId}
            onValueChange={(value) => onFieldChange("categoriaId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="preco">Preço (R$)</Label>
          <Input
            id="preco"
            type="number"
            step="0.01"
            disabled={product.sobConsulta}
            value={product.preco ?? ""}
            onChange={(event) =>
              onFieldChange(
                "preco",
                event.target.value === "" ? null : Number(event.target.value),
              )
            }
          />
          <label className="flex items-center gap-2 pt-1 text-sm text-muted-foreground">
            <Switch
              checked={product.sobConsulta}
              onCheckedChange={(value) => {
                onFieldChange("sobConsulta", value);
                if (value) {
                  onFieldChange("preco", null);
                  onFieldChange("freteHabilitado", false);
                }
              }}
            />
            Preço sob consulta
          </label>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            rows={4}
            maxLength={2000}
            value={product.descricao ?? ""}
            onChange={(event) => onFieldChange("descricao", event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="badge">Selo</Label>
          <Input
            id="badge"
            placeholder="Novo, Mais vendido…"
            maxLength={40}
            value={product.badge ?? ""}
            onChange={(event) => onFieldChange("badge", event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ordem">Ordem de exibição</Label>
          <Input
            id="ordem"
            type="number"
            min={0}
            value={product.ordem}
            onChange={(event) => onFieldChange("ordem", Number(event.target.value))}
          />
        </div>

        {children}
      </CardContent>
    </Card>
  );
}
