"use client";

import { Pencil, Trash2 } from "lucide-react";
import { AdminActionsCell } from "@/components/admin/shared/AdminActionsCell";
import { AdminTableShell } from "@/components/admin/shared/AdminTableShell";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Embalagem } from "@/types";

export function PackagingTable({
  packages,
  onEdit,
  onRemove,
}: {
  packages: Embalagem[];
  onEdit: (packaging: Embalagem) => void;
  onRemove: (packaging: Embalagem) => void;
}) {
  return (
    <AdminTableShell>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Medidas (A×L×C)</TableHead>
            <TableHead>Peso da caixa vazia</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {packages.map((packaging) => (
            <TableRow key={packaging.id}>
              <TableCell className="font-medium">{packaging.nome}</TableCell>
              <TableCell>
                {packaging.alturaCm}×{packaging.larguraCm}×{packaging.comprimentoCm} cm
              </TableCell>
              <TableCell>{packaging.pesoTaraKg} kg</TableCell>
              <AdminActionsCell>
                <Button variant="ghost" size="icon" onClick={() => onEdit(packaging)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onRemove(packaging)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AdminActionsCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AdminTableShell>
  );
}
