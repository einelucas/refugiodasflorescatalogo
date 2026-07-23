/* Listagem de produtos. Destaca os que ainda têm medidas
   herdadas do site antigo, para a cliente saber o que revisar. */

import Link from "next/link";
import { Plus, TriangleAlert } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatarBRL } from "@/lib/utils";
import { AcoesProduto } from "@/components/admin/AcoesProduto";

export const dynamic = "force-dynamic";

export default async function ProdutosPage() {
  const produtos = await db.produto.findMany({
    orderBy: [{ categoria: { ordem: "asc" } }, { ordem: "asc" }],
    include: {
      categoria: { select: { nome: true } },
      imagens: { orderBy: { ordem: "asc" }, take: 1 },
    },
  });

  const aRevisar = produtos.filter((p) => !p.medidasVerificadas).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl">Produtos</h1>
          <p className="text-sm text-muted-foreground">{produtos.length} cadastrados</p>
        </div>
        <Button asChild>
          <Link href="/admin/produtos/novo">
            <Plus className="h-4 w-4" />
            Novo produto
          </Link>
        </Button>
      </div>

      {aRevisar > 0 && (
        <Alert variant="warning">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>
            {aRevisar} produto(s) com medidas não conferidas
          </AlertTitle>
          <AlertDescription>
            Peso e dimensões vieram do site antigo e são estimativas — o frete cobrado pode sair
            errado. Abra cada um, meça a caixa fechada e use &quot;Testar frete&quot; para confirmar.
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14"></TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Embalagem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {produtos.map((p) => (
              <TableRow key={p.id} className={!p.medidasVerificadas ? "bg-amber-50/40" : undefined}>
                <TableCell>
                  {p.imagens[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imagens[0].url}
                      alt=""
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
                <TableCell className="text-xs">
                  {Number(p.alturaCm)}×{Number(p.larguraCm)}×{Number(p.comprimentoCm)} cm ·{" "}
                  {Number(p.pesoKg)} kg
                  {!p.medidasVerificadas && (
                    <Badge variant="warning" className="ml-2 scale-90">
                      revisar
                    </Badge>
                  )}
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
