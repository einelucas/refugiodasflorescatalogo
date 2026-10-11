"use client";

import type { ReactNode } from "react";
import { Ruler } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Embalagem } from "@/types";

type ProductPackagingSectionProps = {
  packages: Embalagem[];
  measurementsVerified: boolean;
  onApplyPackage: (id: string) => void;
  children?: ReactNode;
};

export function ProductPackagingSection({
  packages,
  measurementsVerified,
  onApplyPackage,
  children,
}: ProductPackagingSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="h-4 w-4" />
          Embalagem para envio
          {measurementsVerified && (
            <Badge variant="success" className="ml-1">
              conferida
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <Alert>
          <AlertDescription>
            Meça a <strong>caixa fechada</strong>, pronta para postar — não o produto solto.
            Inclua o peso da própria embalagem.
          </AlertDescription>
        </Alert>

        {packages.length > 0 && (
          <div className="space-y-1.5">
            <Label>Usar um modelo salvo</Label>
            <Select onValueChange={onApplyPackage}>
              <SelectTrigger>
                <SelectValue placeholder="Escolher modelo de caixa…" />
              </SelectTrigger>
              <SelectContent>
                {packages.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.nome} — {item.alturaCm}×{item.larguraCm}×{item.comprimentoCm} cm
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {children}
      </CardContent>
    </Card>
  );
}
