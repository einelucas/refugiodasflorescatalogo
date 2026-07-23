"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Categoria = {
  id: string;
  nome: string;
  slug: string;
  titulo: string;
  subtitulo: string | null;
  aliases: string[];
  iconeUrl: string | null;
  ordem: number;
  ativa: boolean;
  totalProdutos: number;
};

const VAZIA = {
  id: "",
  nome: "",
  slug: "",
  titulo: "",
  subtitulo: "",
  aliases: [] as string[],
  iconeUrl: "",
  ordem: 0,
  ativa: true,
};

/// "Presentes Personalizados" → "presentes-personalizados"
function gerarSlug(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function GerenciarCategorias({ iniciais }: { iniciais: Categoria[] }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [f, setF] = useState(VAZIA);
  const [salvando, setSalvando] = useState(false);

  function abrirNova() {
    setF(VAZIA);
    setAberto(true);
  }

  function abrirEdicao(c: Categoria) {
    setF({
      id: c.id,
      nome: c.nome,
      slug: c.slug,
      titulo: c.titulo,
      subtitulo: c.subtitulo ?? "",
      aliases: c.aliases,
      iconeUrl: c.iconeUrl ?? "",
      ordem: c.ordem,
      ativa: c.ativa,
    });
    setAberto(true);
  }

  async function salvar() {
    setSalvando(true);
    try {
      const url = f.id ? `/api/admin/categorias/${f.id}` : "/api/admin/categorias";
      const r = await fetch(url, {
        method: f.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: f.nome,
          slug: f.slug || gerarSlug(f.nome),
          titulo: f.titulo || f.nome,
          subtitulo: f.subtitulo || null,
          aliases: f.aliases,
          iconeUrl: f.iconeUrl || null,
          ordem: f.ordem,
          ativa: f.ativa,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        toast.error(d.erro ?? "Não foi possível salvar.");
        return;
      }
      toast.success("Categoria salva.");
      setAberto(false);
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  async function remover(c: Categoria) {
    if (!confirm(`Desativar a categoria "${c.nome}"?`)) return;
    const r = await fetch(`/api/admin/categorias/${c.id}`, { method: "DELETE" });
    const d = await r.json();
    if (!r.ok) {
      toast.error(d.erro ?? "Não foi possível desativar.");
      return;
    }
    toast.success("Categoria desativada.");
    router.refresh();
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={abrirNova}>
          <Plus className="h-4 w-4" />
          Nova categoria
        </Button>
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Endereço (slug)</TableHead>
              <TableHead>Produtos</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {iniciais.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.nome}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{c.slug}</TableCell>
                <TableCell>{c.totalProdutos}</TableCell>
                <TableCell>{c.ordem}</TableCell>
                <TableCell>
                  <Badge variant={c.ativa ? "success" : "secondary"}>
                    {c.ativa ? "ativa" : "oculta"}
                  </Badge>
                </TableCell>
                <TableCell className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => abrirEdicao(c)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remover(c)}>
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
            <DialogTitle>{f.id ? "Editar categoria" : "Nova categoria"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input
                value={f.nome}
                onChange={(e) => {
                  const nome = e.target.value;
                  setF((a) => ({
                    ...a,
                    nome,
                    // Slug só acompanha o nome em categorias novas:
                    // mudar o slug de uma existente quebraria links.
                    slug: a.id ? a.slug : gerarSlug(nome),
                    titulo: a.titulo || nome,
                  }));
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Endereço (slug)</Label>
              <Input value={f.slug} onChange={(e) => setF((a) => ({ ...a, slug: e.target.value }))} />
              {f.id && (
                <p className="text-xs text-muted-foreground">
                  Mudar isto quebra links já compartilhados.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Título exibido</Label>
              <Input value={f.titulo} onChange={(e) => setF((a) => ({ ...a, titulo: e.target.value }))} />
            </div>

            <div className="space-y-1.5">
              <Label>Subtítulo</Label>
              <Input
                value={f.subtitulo}
                onChange={(e) => setF((a) => ({ ...a, subtitulo: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Ordem</Label>
              <Input
                type="number"
                min={0}
                value={f.ordem}
                onChange={(e) => setF((a) => ({ ...a, ordem: Number(e.target.value) }))}
              />
            </div>

            <label className="flex items-center gap-3">
              <Switch checked={f.ativa} onCheckedChange={(v) => setF((a) => ({ ...a, ativa: v }))} />
              <span className="text-sm">Visível no site</span>
            </label>

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
