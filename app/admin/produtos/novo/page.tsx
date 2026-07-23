import { db } from "@/lib/db";
import { FormularioProduto } from "@/components/admin/FormularioProduto";

export const dynamic = "force-dynamic";

export default async function NovoProdutoPage() {
  const [categorias, embalagens] = await Promise.all([
    db.categoria.findMany({ where: { ativa: true }, orderBy: { ordem: "asc" }, select: { id: true, nome: true } }),
    db.embalagem.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl">Novo produto</h1>
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
      />
    </div>
  );
}
