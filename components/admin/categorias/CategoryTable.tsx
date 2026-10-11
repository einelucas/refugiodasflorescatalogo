"use client";

import { Pencil, Trash2 } from "lucide-react";
import { AdminActionsCell } from "@/components/admin/shared/AdminActionsCell";
import { AdminStatusBadge } from "@/components/admin/shared/AdminStatusBadge";
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
import type { CategoriaAdmin } from "@/types";

export function CategoryTable({
  categories,
  onEdit,
  onDeactivate,
}: {
  categories: CategoriaAdmin[];
  onEdit: (category: CategoriaAdmin) => void;
  onDeactivate: (category: CategoriaAdmin) => void;
}) {
  return (
    <AdminTableShell>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Endereço (slug)</TableHead>
            <TableHead>Produtos</TableHead>
            <TableHead>Ordem</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">{category.nome}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {category.slug}
              </TableCell>
              <TableCell>{category.totalProdutos}</TableCell>
              <TableCell>{category.ordem}</TableCell>
              <TableCell>
                <AdminStatusBadge
                  active={category.ativa}
                  activeLabel="ativa"
                  inactiveLabel="oculta"
                />
              </TableCell>
              <AdminActionsCell>
                <Button variant="ghost" size="icon" onClick={() => onEdit(category)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDeactivate(category)}>
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
