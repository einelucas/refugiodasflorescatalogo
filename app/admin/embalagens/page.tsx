import { db } from "@/lib/db";
import { GerenciarEmbalagens } from "@/components/admin/GerenciarEmbalagens";

export const dynamic = "force-dynamic";

export default async function EmbalagensPage() {
  const embalagens = await db.embalagem.findMany({ orderBy: { nome: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl">Embalagens</h1>
        <p className="text-sm text-muted-foreground">
          Modelos de caixa salvos. Ao cadastrar um produto, você escolhe um destes em vez de
          redigitar as medidas.
        </p>
      </div>
      <GerenciarEmbalagens
        iniciais={embalagens.map((e) => ({
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
