"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Pagina = {
  id: string;
  slug: string;
  titulo: string;
  conteudoHtml: string | null;
  visivelNoMenu: boolean;
  ordem: number;
};

const VAZIA: Pagina = {
  id: "",
  slug: "",
  titulo: "",
  conteudoHtml: "",
  visivelNoMenu: true,
  ordem: 0,
};

function gerarSlug(t: string) {
  return t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function GerenciarPaginas({ iniciais }: { iniciais: Pagina[] }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [f, setF] = useState<Pagina>(VAZIA);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setSalvando(true);
    try {
      const url = f.id ? `/api/admin/paginas/${f.id}` : "/api/admin/paginas";
      const r = await fetch(url, {
        method: f.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: f.slug || gerarSlug(f.titulo),
          titulo: f.titulo,
          conteudoHtml: f.conteudoHtml || null,
          visivelNoMenu: f.visivelNoMenu,
          ordem: f.ordem,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        toast.error(d.erro ?? "Não foi possível salvar.");
        return;
      }
      toast.success("Página salva.");
      setAberto(false);
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  async function remover(p: Pagina) {
    if (!confirm(`Apagar a página "${p.titulo}"?`)) return;
    const r = await fetch(`/api/admin/paginas/${p.id}`, { method: "DELETE" });
    if (!r.ok) {
      toast.error("Não foi possível apagar.");
      return;
    }
    toast.success("Página apagada.");
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
          Nova página
        </Button>
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>No menu</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead className="w-32"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {iniciais.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.titulo}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">/p/{p.slug}</TableCell>
                <TableCell>
                  <Badge variant={p.visivelNoMenu ? "success" : "secondary"}>
                    {p.visivelNoMenu ? "sim" : "não"}
                  </Badge>
                </TableCell>
                <TableCell>{p.ordem}</TableCell>
                <TableCell className="flex gap-1">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/p/${p.slug}`} target="_blank">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setF(p);
                      setAberto(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remover(p)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{f.id ? "Editar página" : "Nova página"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Título</Label>
              <Input
                value={f.titulo}
                onChange={(e) => {
                  const titulo = e.target.value;
                  setF((a) => ({ ...a, titulo, slug: a.id ? a.slug : gerarSlug(titulo) }));
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Endereço</Label>
              <Input value={f.slug} onChange={(e) => setF((a) => ({ ...a, slug: e.target.value }))} />
              <p className="text-xs text-muted-foreground">A página ficará em /p/{f.slug || "…"}</p>
            </div>

            <div className="space-y-1.5">
              <Label>Conteúdo</Label>
              <Textarea
                rows={12}
                className="font-mono text-xs"
                placeholder="<p>Escreva aqui…</p>"
                value={f.conteudoHtml ?? ""}
                onChange={(e) => setF((a) => ({ ...a, conteudoHtml: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Aceita HTML simples: &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;a&gt;.
              </p>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-3">
                <Switch
                  checked={f.visivelNoMenu}
                  onCheckedChange={(v) => setF((a) => ({ ...a, visivelNoMenu: v }))}
                />
                <span className="text-sm">Mostrar no menu</span>
              </label>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Ordem</Label>
                <Input
                  type="number"
                  min={0}
                  className="w-20"
                  value={f.ordem}
                  onChange={(e) => setF((a) => ({ ...a, ordem: Number(e.target.value) }))}
                />
              </div>
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
