"use client";

import { CircleCheck, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductShippingTestState } from "@/hooks/admin/useProductShippingTest";
import { formatarBRL } from "@/lib/utils";

export function ProductShippingTestSection({
  shippingTest,
}: {
  shippingTest: ProductShippingTestState;
}) {
  return (
    <div className="rounded-lg border bg-muted/40 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="cepTeste">Testar com o CEP</Label>
          <Input
            id="cepTeste"
            className="w-36 bg-background"
            value={shippingTest.cep}
            onChange={(event) => shippingTest.changeCep(event.target.value)}
            placeholder="01001-000"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void shippingTest.testShipping()}
          disabled={shippingTest.testing}
        >
          {shippingTest.testing ? "Consultando…" : "Testar frete"}
        </Button>
      </div>

      {shippingTest.error && (
        <Alert variant="destructive" className="mt-3">
          <TriangleAlert className="h-4 w-4" />
          <AlertDescription>{shippingTest.error}</AlertDescription>
        </Alert>
      )}

      {shippingTest.options && (
        <Alert variant="success" className="mt-3">
          <CircleCheck className="h-4 w-4" />
          <AlertTitle>Frete calculado</AlertTitle>
          <AlertDescription>
            <ul className="mt-1 space-y-0.5">
              {shippingTest.options.map((option) => (
                <li key={option.codigoServico + option.servico}>
                  {option.transportadora} {option.servico} —{" "}
                  <strong>{formatarBRL(option.preco)}</strong>
                  {option.prazoDias != null && ` · ${option.prazoDias} dia(s)`}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
