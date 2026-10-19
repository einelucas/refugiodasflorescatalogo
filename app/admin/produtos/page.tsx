import Link from "next/link";
import { Plus } from "lucide-react";

import { ProductList } from "@/components/admin/produtos/ProductList";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProdutosPage() {
  const produtos = await db.produto.findMany({
    orderBy: [{ categoria: { ordem: "asc" } }, { ordem: "asc" }],
    select: {
      id: true, nome: true, ativo: true, sobConsulta: true,
      preco: true, alturaCm: true, larguraCm: true, comprimentoCm: true, pesoKg: true,
      categoria: { select: { nome: true } },
      imagens: { orderBy: { ordem: "asc" }, take: 1, select: { url: true } },
    },
  });

  // Produto agora atravessa o limite Server → Client para permitir busca instantânea.
  // Decimal do Prisma deve ser convertido antes de serializar as props.
  const produtosSerializados = produtos.map((produto) => ({
    ...produto,
    preco: produto.preco?.toNumber() ?? null,
    alturaCm: produto.alturaCm.toNumber(),
    larguraCm: produto.larguraCm.toNumber(),
    comprimentoCm: produto.comprimentoCm.toNumber(),
    pesoKg: produto.pesoKg.toNumber(),
  }));

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

      <ProductList products={produtosSerializados} />
    </div>
  );
}
