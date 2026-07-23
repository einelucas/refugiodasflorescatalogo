"use client";

/* =========================================================
   Formulário de cadastro/edição de produto.

   O bloco "Embalagem" tem tratamento especial: é onde a cliente
   mais erra, e o erro só aparece semanas depois, quando um
   comprador reclama que o frete não calcula. Por isso o botão
   "Testar frete", que consulta a Frenet com os valores digitados
   ANTES de salvar.

   O teste bem-sucedido marca medidasVerificadas = true, que é
   como o painel distingue medidas conferidas das estimativas
   herdadas do site antigo.
   ========================================================= */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { toast } from "sonner";
import { Ruler, TriangleAlert, CircleCheck, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LIMITES } from "@/lib/validacao";
import { mascararCEP } from "@/lib/utils";

type Categoria = { id: string; nome: string };
type Embalagem = {
  id: string;
  nome: string;
  alturaCm: number;
  larguraCm: number;
  comprimentoCm: number;
  pesoTaraKg: number;
};
type Imagem = { url: string; alt: string | null };
type OpcaoFrete = {
  transportadora: string;
  servico: string;
  codigoServico: string;
  preco: number;
  prazoDias: number | null;
};

export type ProdutoForm = {
  id?: string;
  nome: string;
  categoriaId: string;
  descricao: string | null;
  preco: number | null;
  sobConsulta: boolean;
  badge: string | null;
  pesoKg: number;
  alturaCm: number;
  larguraCm: number;
  comprimentoCm: number;
  valorDeclarado: number | null;
  freteHabilitado: boolean;
  medidasVerificadas: boolean;
  ordem: number;
  ativo: boolean;
  imagens: Imagem[];
};

const CEP_TESTE_PADRAO = "01001-000";

export function FormularioProduto({
  categorias,
  embalagens,
  inicial,
}: {
  categorias: Categoria[];
  embalagens: Embalagem[];
  inicial?: ProdutoForm;
}) {
  const router = useRouter();

  const [f, setF] = useState<ProdutoForm>(
    inicial ?? {
      nome: "",
      categoriaId: categorias[0]?.id ?? "",
      descricao: "",
      preco: null,
      sobConsulta: false,
      badge: "",
      pesoKg: 0,
      alturaCm: 0,
      larguraCm: 0,
      comprimentoCm: 0,
      valorDeclarado: null,
      freteHabilitado: true,
      medidasVerificadas: false,
      ordem: 0,
      // Produto novo nasce despublicado: a cliente cadastra,
      // testa o frete, confere a foto, e só então publica.
      ativo: false,
      imagens: [],
    },
  );

  const [cepTeste, setCepTeste] = useState(CEP_TESTE_PADRAO);
  const [testando, setTestando] = useState(false);
  const [opcoes, setOpcoes] = useState<OpcaoFrete[] | null>(null);
  const [erroTeste, setErroTeste] = useState<string | null>(null);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const soma = Number(f.alturaCm || 0) + Number(f.larguraCm || 0) + Number(f.comprimentoCm || 0);
  const somaExcedida = soma > LIMITES.somaMax;

  function set<K extends keyof ProdutoForm>(campo: K, valor: ProdutoForm[K]) {
    setF((atual) => {
      const novo = { ...atual, [campo]: valor };
      // Mexeu nas medidas → o teste anterior não vale mais, e a
      // verificação precisa ser refeita.
      if (["pesoKg", "alturaCm", "larguraCm", "comprimentoCm"].includes(campo as string)) {
        novo.medidasVerificadas = false;
      }
      return novo;
    });
    if (["pesoKg", "alturaCm", "larguraCm", "comprimentoCm"].includes(campo as string)) {
      setOpcoes(null);
      setErroTeste(null);
    }
  }

  function aplicarEmbalagem(id: string) {
    const e = embalagens.find((x) => x.id === id);
    if (!e) return;
    setF((a) => ({
      ...a,
      alturaCm: e.alturaCm,
      larguraCm: e.larguraCm,
      comprimentoCm: e.comprimentoCm,
      medidasVerificadas: false,
    }));
    setOpcoes(null);
    toast.info(`Medidas de "${e.nome}" aplicadas. Confirme o peso e teste o frete.`);
  }

  async function enviarFoto(arquivo: File) {
    const tiposAceitos = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    const tamanhoMaximo = 6 * 1024 * 1024;

    if (!tiposAceitos.includes(arquivo.type)) {
      toast.error("Use uma imagem JPG, PNG, WebP ou AVIF.");
      return;
    }

    if (arquivo.size > tamanhoMaximo) {
      toast.error("A imagem deve ter no máximo 6 MB.");
      return;
    }

    setEnviandoFoto(true);
    try {
      const extensao = arquivo.type.split("/")[1].replace("jpeg", "jpg");
      const pathname = `produtos/${crypto.randomUUID()}.${extensao}`;

      // Upload direto do navegador para o Vercel Blob. A rota
      // /api/admin/upload apenas autentica e gera o token temporário.
      const blob = await upload(pathname, arquivo, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
      });

      setF((a) => ({
        ...a,
        imagens: [...a.imagens, { url: blob.url, alt: a.nome }],
      }));
      toast.success("Imagem enviada.");
    } catch (erro) {
      console.error("[upload] falha no navegador:", erro);
      toast.error(
        erro instanceof Error
          ? erro.message
          : "Não foi possível enviar a imagem. Tente novamente.",
      );
    } finally {
      setEnviandoFoto(false);
    }
  }

  async function testarFrete() {
    setTestando(true);
    setErroTeste(null);
    setOpcoes(null);
    try {
      const r = await fetch("/api/admin/testar-frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pesoKg: f.pesoKg,
          alturaCm: f.alturaCm,
          larguraCm: f.larguraCm,
          comprimentoCm: f.comprimentoCm,
          valorDeclarado: f.valorDeclarado ?? f.preco ?? 100,
          cepDestino: cepTeste,
          quantidade: 1,
        }),
      });
      const d = await r.json();

      if (!r.ok) {
        setErroTeste(d.erro ?? "Não foi possível testar.");
        return;
      }
      if (!d.opcoes?.length) {
        setErroTeste(d.aviso ?? "Nenhuma opção de frete para essas medidas.");
        return;
      }

      setOpcoes(d.opcoes);
      // O teste passou: as medidas produzem cotação real.
      setF((a) => ({ ...a, medidasVerificadas: true }));
      toast.success("Frete calculado. Medidas marcadas como conferidas.");
    } catch {
      setErroTeste("Erro de conexão ao testar o frete.");
    } finally {
      setTestando(false);
    }
  }

  async function salvar() {
    setSalvando(true);
    try {
      const url = f.id ? `/api/admin/produtos/${f.id}` : "/api/admin/produtos";
      const r = await fetch(url, {
        method: f.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...f,
          preco: f.sobConsulta ? null : f.preco,
          descricao: f.descricao || null,
          badge: f.badge || null,
          valorDeclarado: f.valorDeclarado || null,
          imagens: f.imagens.map((img, i) => ({ url: img.url, alt: img.alt, ordem: i })),
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        toast.error(d.erro ?? "Não foi possível salvar.");
        return;
      }
      toast.success("Produto salvo.");
      router.push("/admin/produtos");
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="space-y-6">
      {!f.medidasVerificadas && f.id && (
        <Alert variant="warning">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Medidas ainda não conferidas</AlertTitle>
          <AlertDescription>
            Peso e dimensões deste produto vieram do site antigo e são estimativas. Meça a caixa
            fechada, ajuste abaixo e use <strong>Testar frete</strong> para confirmar.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Dados do produto</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" value={f.nome} onChange={(e) => set("nome", e.target.value)} maxLength={120} />
          </div>

          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Select value={f.categoriaId} onValueChange={(v) => set("categoriaId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="preco">Preço (R$)</Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              disabled={f.sobConsulta}
              value={f.preco ?? ""}
              onChange={(e) => set("preco", e.target.value === "" ? null : Number(e.target.value))}
            />
            <label className="flex items-center gap-2 pt-1 text-sm text-muted-foreground">
              <Switch
                checked={f.sobConsulta}
                onCheckedChange={(v) => {
                  set("sobConsulta", v);
                  if (v) {
                    set("preco", null);
                    // Sem preço fixo não há como cotar frete.
                    set("freteHabilitado", false);
                  }
                }}
              />
              Preço sob consulta
            </label>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              rows={4}
              maxLength={2000}
              value={f.descricao ?? ""}
              onChange={(e) => set("descricao", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="badge">Selo</Label>
            <Input
              id="badge"
              placeholder="Novo, Mais vendido…"
              maxLength={40}
              value={f.badge ?? ""}
              onChange={(e) => set("badge", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ordem">Ordem de exibição</Label>
            <Input
              id="ordem"
              type="number"
              min={0}
              value={f.ordem}
              onChange={(e) => set("ordem", Number(e.target.value))}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Fotos</Label>
            <div className="flex flex-wrap gap-3">
              {f.imagens.map((img, i) => (
                <div key={img.url + i} className="group relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.alt ?? f.nome}
                    className="h-20 w-20 rounded-md border object-cover"
                  />
                  {i === 0 && (
                    <Badge className="absolute -top-2 -left-1 scale-90" variant="secondary">
                      capa
                    </Badge>
                  )}
                  <button
                    type="button"
                    onClick={() => set("imagens", f.imagens.filter((_, j) => j !== i))}
                    className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remover foto"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed text-xs text-muted-foreground hover:bg-accent">
                <Upload className="h-4 w-4" />
                {enviandoFoto ? "…" : "Enviar"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  onChange={(e) => {
                    const arq = e.target.files?.[0];
                    if (arq) void enviarFoto(arq);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">A primeira foto aparece no card do catálogo.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Embalagem para envio
            {f.medidasVerificadas && (
              <Badge variant="success" className="ml-1">
                conferida
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Alert>
            <AlertDescription>
              Meça a <strong>caixa fechada</strong>, pronta para postar — não o produto solto. Inclua
              o peso da própria embalagem.
            </AlertDescription>
          </Alert>

          {embalagens.length > 0 && (
            <div className="space-y-1.5">
              <Label>Usar um modelo salvo</Label>
              <Select onValueChange={aplicarEmbalagem}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolher modelo de caixa…" />
                </SelectTrigger>
                <SelectContent>
                  {embalagens.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nome} — {e.alturaCm}×{e.larguraCm}×{e.comprimentoCm} cm
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input
                id="peso"
                type="number"
                step="0.001"
                value={f.pesoKg || ""}
                onChange={(e) => set("pesoKg", Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">máx. {LIMITES.pesoMaxKg}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="altura">Altura (cm)</Label>
              <Input
                id="altura"
                type="number"
                step="0.1"
                value={f.alturaCm || ""}
                onChange={(e) => set("alturaCm", Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">mín. {LIMITES.alturaMin}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="largura">Largura (cm)</Label>
              <Input
                id="largura"
                type="number"
                step="0.1"
                value={f.larguraCm || ""}
                onChange={(e) => set("larguraCm", Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">mín. {LIMITES.larguraMin}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="comprimento">Comprimento (cm)</Label>
              <Input
                id="comprimento"
                type="number"
                step="0.1"
                value={f.comprimentoCm || ""}
                onChange={(e) => set("comprimentoCm", Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">mín. {LIMITES.comprimentoMin}</p>
            </div>
          </div>

          <p className={`text-sm ${somaExcedida ? "text-destructive" : "text-muted-foreground"}`}>
            Soma das dimensões: {soma.toFixed(1)} cm
            {somaExcedida && ` — acima do limite de ${LIMITES.somaMax} cm`}
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="declarado">
              Valor declarado (R$){" "}
              <span className="font-normal text-muted-foreground">— vazio usa o preço</span>
            </Label>
            <Input
              id="declarado"
              type="number"
              step="0.01"
              value={f.valorDeclarado ?? ""}
              onChange={(e) =>
                set("valorDeclarado", e.target.value === "" ? null : Number(e.target.value))
              }
            />
          </div>

          <label className="flex items-start gap-3">
            <Switch
              checked={f.freteHabilitado}
              onCheckedChange={(v) => set("freteHabilitado", v)}
              disabled={f.sobConsulta}
            />
            <span className="text-sm">
              Calcular frete para este produto
              <span className="block text-xs text-muted-foreground">
                Desmarque para itens de retirada ou entrega local.
              </span>
            </span>
          </label>

          <div className="rounded-lg border bg-muted/40 p-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cepTeste">Testar com o CEP</Label>
                <Input
                  id="cepTeste"
                  className="w-36 bg-background"
                  value={cepTeste}
                  onChange={(e) => setCepTeste(mascararCEP(e.target.value))}
                  placeholder="01001-000"
                />
              </div>
              <Button type="button" variant="secondary" onClick={testarFrete} disabled={testando}>
                {testando ? "Consultando…" : "Testar frete"}
              </Button>
            </div>

            {erroTeste && (
              <Alert variant="destructive" className="mt-3">
                <TriangleAlert className="h-4 w-4" />
                <AlertDescription>{erroTeste}</AlertDescription>
              </Alert>
            )}

            {opcoes && (
              <Alert variant="success" className="mt-3">
                <CircleCheck className="h-4 w-4" />
                <AlertTitle>Frete calculado</AlertTitle>
                <AlertDescription>
                  <ul className="mt-1 space-y-0.5">
                    {opcoes.map((o) => (
                      <li key={o.codigoServico + o.servico}>
                        {o.transportadora} {o.servico} —{" "}
                        <strong>
                          {o.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </strong>
                        {o.prazoDias != null && ` · ${o.prazoDias} dia(s)`}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
          <label className="flex items-start gap-3">
            <Switch checked={f.ativo} onCheckedChange={(v) => set("ativo", v)} />
            <span className="text-sm">
              Publicado no site
              <span className="block text-xs text-muted-foreground">
                Deixe desligado enquanto estiver preenchendo.
              </span>
            </span>
          </label>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/admin/produtos")}>
              Cancelar
            </Button>
            <Button onClick={salvar} disabled={salvando}>
              {salvando ? "Salvando…" : "Salvar produto"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
