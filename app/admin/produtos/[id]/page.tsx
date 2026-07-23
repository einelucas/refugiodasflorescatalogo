import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { FormularioProduto } from "@/components/admin/FormularioProduto";

export const dynamic = "force-dynamic";

export default async function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [produto, categorias, embalagens] = await Promise.all([
    db.produto.findUnique({ where: { id }, include: { imagens: { orderBy: { ordem: "asc" } } } }),
    db.categoria.findMany({ where: { ativa: true }, orderBy: { ordem: "asc" }, select: { id: true, nome: true } }),
    db.embalagem.findMany({ orderBy: { nome: "asc" } }),
  ]);

  if (!produto) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl">{produto.nome}</h1>
      <FormularioProduto
        categorias={categorias}
        embalagens={embalagens.map((e) => ({
          id: e.id,
          nome: e.nome,
          alturaCm: Number(e.alturaCm),
          larguraCm: Number(e.larguraCm),
          comprimentoCm: Number(e.comprimentoCm),
          pesoTaraKg: Number(e.pesoTaraKg),
        }))}
        inicial={{
          id: produto.id,
          nome: produto.nome,
          categoriaId: produto.categoriaId,
          descricao: produto.descricao,
          preco: produto.preco === null ? null : Number(produto.preco),
          sobConsulta: produto.sobConsulta,
          badge: produto.badge,
          pesoKg: Number(produto.pesoKg),
          alturaCm: Number(produto.alturaCm),
          larguraCm: Number(produto.larguraCm),
          comprimentoCm: Number(produto.comprimentoCm),
          valorDeclarado: produto.valorDeclarado === null ? null : Number(produto.valorDeclarado),
          freteHabilitado: produto.freteHabilitado,
          medidasVerificadas: produto.medidasVerificadas,
          ordem: produto.ordem,
          ativo: produto.ativo,
          imagens: produto.imagens.map((i) => ({ url: i.url, alt: i.alt })),
        }}
      />
    </div>
  );
}
