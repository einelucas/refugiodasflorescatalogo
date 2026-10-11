"use client";

import Link from "next/link";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
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
import type { Pagina } from "@/types";

export function PageTable({
  pages,
  onEdit,
  onRemove,
}: {
  pages: Pagina[];
  onEdit: (page: Pagina) => void;
  onRemove: (page: Pagina) => void;
}) {
  return (
    <AdminTableShell>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Endereço</TableHead>
            <TableHead>No menu</TableHead>
            <TableHead>Ordem</TableHead>
            <TableHead className="w-32" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map((page) => (
            <TableRow key={page.id}>
              <TableCell className="font-medium">{page.titulo}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                /p/{page.slug}
              </TableCell>
              <TableCell>
                <AdminStatusBadge
                  active={page.visivelNoMenu}
                  activeLabel="sim"
                  inactiveLabel="não"
                />
              </TableCell>
              <TableCell>{page.ordem}</TableCell>
              <AdminActionsCell>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/p/${page.slug}`} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onEdit(page)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onRemove(page)}>
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
