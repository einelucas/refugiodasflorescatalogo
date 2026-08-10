import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

import { AcoesProduto } from "@/components/admin/AcoesProduto";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/db";
import { formatarBRL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProdutosPage() {
  const produtos = await db.produto.findMany({
    orderBy: [{ categoria: { ordem: "asc" } }, { ordem: "asc" }],
    include: {
      categoria: { select: { nome: true } },
      imagens: { orderBy: { ordem: "asc" }, take: 1 },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl">Produtos</h1>
          <p className="text-sm text-muted-foreground">{produtos.length} cadastrados</p>
        </div>

        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/produtos/novo">
            <Plus className="h-4 w-4" />
            Novo produto
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 md:hidden">
        {produtos.map((p) => (
          <article key={p.id} className="rounded-lg border bg-background p-3 shadow-sm">
            <div className="flex min-w-0 gap-3">
              {p.imagens[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.imagens[0].url}
                  alt=""
                  loading="lazy"
                  className="h-16 w-16 shrink-0 rounded-md border object-cover"
                />
              ) : (
                <div className="h-16 w-16 shrink-0 rounded-md border bg-muted" />
              )}

              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/produtos/${p.id}`}
                  className="block truncate font-medium hover:underline"
                >
                  {p.nome}
                </Link>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{p.categoria.nome}</p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">
                    {p.sobConsulta ? "A consultar" : formatarBRL(Number(p.preco))}
                  </span>
                  <Badge variant={p.ativo ? "success" : "secondary"}>
                    {p.ativo ? "publicado" : "rascunho"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              Embalagem: {Number(p.alturaCm)}×{Number(p.larguraCm)}×
              {Number(p.comprimentoCm)} cm · {Number(p.pesoKg)} kg
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href={`/admin/produtos/${p.id}`}>
                  <Pencil className="h-4 w-4" />
                  Editar
                </Link>
              </Button>
              <AcoesProduto id={p.id} ativo={p.ativo} />
            </div>
          </article>
        ))}
      </div>

      <div className="hidden max-w-full overflow-hidden rounded-lg border bg-background md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14" />
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Embalagem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {produtos.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {p.imagens[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imagens[0].url}
                      alt=""
                      loading="lazy"
                      className="h-10 w-10 rounded border object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded border bg-muted" />
                  )}
                </TableCell>

                <TableCell className="font-medium">
                  <Link href={`/admin/produtos/${p.id}`} className="hover:underline">
                    {p.nome}
                  </Link>
                </TableCell>

                <TableCell className="text-muted-foreground">{p.categoria.nome}</TableCell>

                <TableCell>
                  {p.sobConsulta ? (
                    <span className="text-muted-foreground">a consultar</span>
                  ) : (
                    formatarBRL(Number(p.preco))
                  )}
                </TableCell>

                <TableCell className="whitespace-nowrap text-xs">
                  {Number(p.alturaCm)}×{Number(p.larguraCm)}×{Number(p.comprimentoCm)} cm ·{" "}
                  {Number(p.pesoKg)} kg
                </TableCell>

                <TableCell>
                  <Badge variant={p.ativo ? "success" : "secondary"}>
                    {p.ativo ? "publicado" : "rascunho"}
                  </Badge>
                </TableCell>

                <TableCell>
                  <AcoesProduto id={p.id} ativo={p.ativo} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
