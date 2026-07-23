"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LIMITES } from "@/lib/validacao";

type Embalagem = {
  id: string;
  nome: string;
  alturaCm: number;
  larguraCm: number;
  comprimentoCm: number;
  pesoTaraKg: number;
};

const VAZIA = { id: "", nome: "", alturaCm: 0, larguraCm: 0, comprimentoCm: 0, pesoTaraKg: 0 };

export function GerenciarEmbalagens({ iniciais }: { iniciais: Embalagem[] }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [f, setF] = useState<Embalagem>(VAZIA);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setSalvando(true);
    try {
      const url = f.id ? `/api/admin/embalagens/${f.id}` : "/api/admin/embalagens";
      const r = await fetch(url, {
        method: f.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: f.nome,
          alturaCm: f.alturaCm,
          larguraCm: f.larguraCm,
          comprimentoCm: f.comprimentoCm,
          pesoTaraKg: f.pesoTaraKg,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        toast.error(d.erro ?? "Não foi possível salvar.");
        return;
      }
      toast.success("Embalagem salva.");
      setAberto(false);
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  async function remover(e: Embalagem) {
    if (!confirm(`Apagar o modelo "${e.nome}"? Produtos já cadastrados não são afetados.`)) return;
    const r = await fetch(`/api/admin/embalagens/${e.id}`, { method: "DELETE" });
    if (!r.ok) {
      toast.error("Não foi possível apagar.");
      return;
    }
    toast.success("Modelo apagado.");
    router.refresh();
  }

  return (
    <>
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setF(VAZIA);
            setAberto(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Novo modelo
        </Button>
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Medidas (A×L×C)</TableHead>
              <TableHead>Peso da caixa vazia</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {iniciais.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium">{e.nome}</TableCell>
                <TableCell>
                  {e.alturaCm}×{e.larguraCm}×{e.comprimentoCm} cm
                </TableCell>
                <TableCell>{e.pesoTaraKg} kg</TableCell>
                <TableCell className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setF(e);
                      setAberto(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remover(e)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{f.id ? "Editar modelo" : "Novo modelo de caixa"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input
                placeholder="Caixa buquê médio"
                value={f.nome}
                onChange={(e) => setF((a) => ({ ...a, nome: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Altura (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={f.alturaCm || ""}
                  onChange={(e) => setF((a) => ({ ...a, alturaCm: Number(e.target.value) }))}
                />
                <p className="text-xs text-muted-foreground">mín. {LIMITES.alturaMin}</p>
              </div>
              <div className="space-y-1.5">
                <Label>Largura (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={f.larguraCm || ""}
                  onChange={(e) => setF((a) => ({ ...a, larguraCm: Number(e.target.value) }))}
                />
                <p className="text-xs text-muted-foreground">mín. {LIMITES.larguraMin}</p>
              </div>
              <div className="space-y-1.5">
                <Label>Comprimento (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={f.comprimentoCm || ""}
                  onChange={(e) => setF((a) => ({ ...a, comprimentoCm: Number(e.target.value) }))}
                />
                <p className="text-xs text-muted-foreground">mín. {LIMITES.comprimentoMin}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Peso da caixa vazia (kg)</Label>
              <Input
                type="number"
                step="0.001"
                value={f.pesoTaraKg || ""}
                onChange={(e) => setF((a) => ({ ...a, pesoTaraKg: Number(e.target.value) }))}
              />
              <p className="text-xs text-muted-foreground">
                Só referência — o peso final é informado no produto.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={salvar} disabled={salvando}>
                {salvando ? "Salvando…" : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
