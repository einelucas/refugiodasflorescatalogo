"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminSearch } from "@/components/admin/layout/AdminSearchContext";
import { correspondeBusca } from "@/lib/admin/busca";
type Materia = { id: string; nome: string; quantidade: string; unidade: string };
type ItemFicha = { materiaPrimaId: string; quantidade: string };
type Produto = { id: string; nome: string; preco: string | null; fichaTecnica: ItemFicha[] };
type Producao = { id: string; nomeProduto: string; quantidade: number; criadaEm: string };
type Venda = { id: string; nomeProduto: string; quantidade: number; total: string; criadaEm: string; cliente: string | null };
type Despesa = { id: string; descricao: string; categoria: string; valor: string; criadaEm: string };
type Dados = { schemaPendente?: boolean; materias: Materia[]; produtos: Produto[]; producoes: Producao[]; vendas: Venda[]; despesas: Despesa[] };
type Aba = "estoque" | "producao" | "financeiro" | "relatorios";
const moeda = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const numero = (v: string | number) => Number(v);
const dataBR = (v: string) => new Date(v).toLocaleDateString("pt-BR");
function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return <Card><CardHeader><CardTitle className="font-serif text-xl">{titulo}</CardTitle></CardHeader><CardContent className="space-y-4">{children}</CardContent></Card>;
}
function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5 text-sm"><span className="font-medium">{rotulo}</span>{children}</label>;
}
function SeletorProduto({ produtos, value, onChange }: { produtos: Produto[]; value: string; onChange: (v: string) => void }) {
  return <select className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={value} onChange={e => onChange(e.target.value)}>
    <option value="">Selecione o produto</option>{produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
  </select>;
}
export function GestaoPainel({ aba }: { aba: Aba }) {
  const { query } = useAdminSearch();
  const [dados, setDados] = useState<Dados | null>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [materia, setMateria] = useState({ id: "", nome: "", quantidade: "", unidade: "un" });
  const [produtoId, setProdutoId] = useState("");
  const [ficha, setFicha] = useState<{ materiaPrimaId: string; quantidade: string }[]>([]);
  const [qtd, setQtd] = useState("1");
  const [cliente, setCliente] = useState("");
  const [despesa, setDespesa] = useState({ descricao: "", valor: "", categoria: "materiais" });
  const [periodo, setPeriodo] = useState("");
  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    for (let tentativa = 1; tentativa <= 2; tentativa++) {
      try {
        const r = await fetch("/api/admin/gestao", { cache: "no-store" });
        const d = await r.json();
        if (!r.ok) {
          const falha = new Error(d.erro ?? "Erro ao carregar dados.");
          // 5xx pode ser o banco acordando; tenta mais uma vez.
          if (r.status < 500) throw Object.assign(falha, { semRepetir: true });
          throw falha;
        }
        setDados(d);
        setCarregando(false);
        return;
      } catch (e) {
        const semRepetir = (e as { semRepetir?: boolean }).semRepetir === true;
        if (semRepetir || tentativa === 2) {
          setErro(e instanceof Error ? e.message : "Erro de conexão.");
          setCarregando(false);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }
  }, []);
  useEffect(() => { void carregar(); }, [carregar]);
  useEffect(() => {
    const p = dados?.produtos.find(p => p.id === produtoId);
    setFicha(p?.fichaTecnica.map(x => ({ materiaPrimaId: x.materiaPrimaId, quantidade: x.quantidade })) ?? []);
  }, [produtoId, dados]);
  async function executar(acao: string, payload?: unknown, id?: string) {
    if (dados?.schemaPendente) { toast.error("As tabelas da gestão ainda precisam ser criadas no banco."); return false; }
    setSalvando(true);
    try {
      const r = await fetch("/api/admin/gestao", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao, payload, id }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.erro || "Falha ao salvar.");
      toast.success("Operação concluída.");
      await carregar();
      return true;
    } catch (e) { toast.error(e instanceof Error ? e.message : "Falha ao salvar."); return false; }
    finally { setSalvando(false); }
  }
  const produto = dados?.produtos.find(p => p.id === produtoId);
  const receita = (dados?.vendas ?? []).reduce((s, v) => s + numero(v.total), 0);
  const despesasTotal = (dados?.despesas ?? []).reduce((s, v) => s + numero(v.valor), 0);
  const vendasPeriodo = useMemo(() => (dados?.vendas ?? []).filter(v => (!periodo || v.criadaEm.slice(0, 7) === periodo) && correspondeBusca(query, v.nomeProduto, v.cliente, v.total)), [dados, periodo, query]);
  const despesasPeriodo = useMemo(() => (dados?.despesas ?? []).filter(d => (!periodo || d.criadaEm.slice(0, 7) === periodo) && correspondeBusca(query, d.descricao, d.categoria, d.valor)), [dados, periodo, query]);
  if (carregando && !dados) return <p role="status" className="py-12 text-center text-muted-foreground">Carregando gestão interna...</p>;
  if (erro) return <div role="alert" className="space-y-3"><p>{erro}</p><Button onClick={() => void carregar()}>Tentar novamente</Button></div>;
  if (!dados) return null;
  const selecionados = dados.materias.filter(m => correspondeBusca(query, m.nome, m.unidade));
  const producoesFiltradas = dados.producoes.filter(p => correspondeBusca(query, p.nomeProduto, p.quantidade, p.criadaEm));
  const editarMateria = (m: Materia) => setMateria({ id: m.id, nome: m.nome, quantidade: m.quantidade, unidade: m.unidade });
  const renomear = (s: string) => s === "materiais" ? "Materiais" : s === "marketing" ? "Marketing" : s === "equipamentos" ? "Equipamentos" : "Outros";
  return <div className="space-y-6">
    {dados.schemaPendente && <div role="status" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">Prévia do painel: as novas tabelas ainda precisam ser criadas no PostgreSQL com <code>npm run db:deploy</code>. Os lançamentos estão desabilitados até a migração. Nenhum dado do Firebase será importado.</div>}
    <header className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="font-serif text-2xl">{({ estoque: "Estoque", producao: "Produção", financeiro: "Financeiro", relatorios: "Relatórios" } as const)[aba]}</h1><p className="text-sm text-muted-foreground">Gestão interna do Refúgio das Flores</p></div><Button variant="outline" disabled={carregando} onClick={() => void carregar()}>{carregando ? "Atualizando..." : "Atualizar dados"}</Button></header>
    {aba === "estoque" && <>
      <Secao titulo={materia.id ? "Editar matéria-prima" : "Adicionar matéria-prima"}>
        <form className="grid gap-3 sm:grid-cols-4" onSubmit={async e => { e.preventDefault(); if (await executar(materia.id ? "estoque.editar" : "estoque.criar", { nome: materia.nome, quantidade: numero(materia.quantidade), unidade: materia.unidade }, materia.id || undefined)) setMateria({ id: "", nome: "", quantidade: "", unidade: "un" }); }}>
          <Campo rotulo="Nome"><Input required value={materia.nome} onChange={e => setMateria({ ...materia, nome: e.target.value })}/></Campo>
          <Campo rotulo="Quantidade disponível"><Input required type="number" min="0" step="0.001" value={materia.quantidade} onChange={e => setMateria({ ...materia, quantidade: e.target.value })}/></Campo>
          <Campo rotulo="Unidade"><Input required value={materia.unidade} onChange={e => setMateria({ ...materia, unidade: e.target.value })}/></Campo>
          <div className="flex items-end gap-2"><Button disabled={salvando} type="submit">{salvando ? "Salvando..." : materia.id ? "Atualizar" : "Adicionar"}</Button>{materia.id && <Button type="button" variant="outline" onClick={() => setMateria({ id: "", nome: "", quantidade: "", unidade: "un" })}>Cancelar</Button>}</div>
        </form>
      </Secao>
      <Secao titulo="Matérias-primas cadastradas"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-2">Nome</th><th>Disponível</th><th className="text-right">Ações</th></tr></thead><tbody>{selecionados.map(m => <tr key={m.id} className="border-b"><td className="p-2">{m.nome}</td><td>{m.quantidade} {m.unidade}</td><td className="space-x-2 py-2 text-right"><Button size="sm" variant="outline" onClick={() => editarMateria(m)}>Editar</Button><Button size="sm" variant="outline" disabled={salvando} onClick={async () => { if (confirm("Excluir matéria-prima?")) await executar("estoque.excluir", undefined, m.id); }}>Excluir</Button></td></tr>)}</tbody></table>{selecionados.length === 0 && <p className="py-4 text-sm text-muted-foreground">Nenhum item encontrado.</p>}</div></Secao>
    </>}
    {aba === "producao" && <>
      <Secao titulo="Ficha técnica do produto"><Campo rotulo="Produto"><SeletorProduto produtos={dados.produtos} value={produtoId} onChange={setProdutoId}/></Campo>
        {produto && <div className="space-y-3">{ficha.map((item, idx) => <div key={idx} className="grid gap-2 sm:grid-cols-[1fr_120px_auto]">
          <select aria-label="Matéria-prima" className="h-9 rounded-md border bg-background px-3 text-sm" value={item.materiaPrimaId} onChange={e => setFicha(ficha.map((f, i) => i === idx ? { ...f, materiaPrimaId: e.target.value } : f))}><option value="">Selecione a matéria-prima</option>{dados.materias.map(m => <option key={m.id} value={m.id}>{m.nome} ({m.unidade})</option>)}</select>
          <Input aria-label="Quantidade por unidade" type="number" min="0.001" step="0.001" value={item.quantidade} onChange={e => setFicha(ficha.map((f, i) => i === idx ? { ...f, quantidade: e.target.value } : f))}/>
          <Button type="button" variant="outline" onClick={() => setFicha(ficha.filter((_, i) => i !== idx))}>Remover</Button></div>)}
          <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => setFicha([...ficha, { materiaPrimaId: "", quantidade: "1" }])}>Adicionar ingrediente</Button><Button disabled={salvando || ficha.some(f => !f.materiaPrimaId || numero(f.quantidade) <= 0)} onClick={() => void executar("ficha.salvar", { produtoId, ingredientes: ficha.map(f => ({ materiaPrimaId: f.materiaPrimaId, quantidade: numero(f.quantidade) })) })}>{salvando ? "Salvando..." : "Salvar ficha"}</Button></div>
        </div>}
      </Secao>
      <Secao titulo="Registrar produção"><form className="grid gap-3 sm:grid-cols-[1fr_120px_auto] sm:items-end" onSubmit={async e => { e.preventDefault(); if (await executar("producao.registrar", { produtoId, quantidade: numero(qtd) })) setQtd("1"); }}><Campo rotulo="Produto"><SeletorProduto produtos={dados.produtos} value={produtoId} onChange={setProdutoId}/></Campo><Campo rotulo="Quantidade"><Input required type="number" min="1" step="1" value={qtd} onChange={e => setQtd(e.target.value)}/></Campo><Button type="submit" disabled={salvando || !produtoId}>{salvando ? "Produzindo..." : "Produzir"}</Button></form><p className="text-xs text-muted-foreground">A produção baixa os ingredientes do estoque de forma atômica. A venda não baixa novamente.</p></Secao>
      <Secao titulo="Produções recentes">{producoesFiltradas.length ? <div className="space-y-2">{producoesFiltradas.map(p => <p className="border-b py-2 text-sm" key={p.id}>{dataBR(p.criadaEm)} — {p.quantidade} × {p.nomeProduto}</p>)}</div> : <p className="text-sm text-muted-foreground">{query ? "Nenhuma produção corresponde à busca." : "Nenhuma produção registrada."}</p>}</Secao>
    </>}
    {aba === "financeiro" && <>
      <div className="grid gap-4 sm:grid-cols-3">{[["Receita total", receita], ["Despesas totais", despesasTotal], ["Saldo (receita − despesas)", receita - despesasTotal]].map(([label, value]) => <Card key={label}><CardContent className="pt-5"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{moeda(Number(value))}</p></CardContent></Card>)}</div>
      <div className="grid gap-4 lg:grid-cols-2">
      <Secao titulo="Registrar venda"><form className="space-y-3" onSubmit={async e => { e.preventDefault(); if (await executar("venda.registrar", { produtoId, quantidade: numero(qtd), cliente })) { setCliente(""); setQtd("1"); } }}><Campo rotulo="Produto"><SeletorProduto produtos={dados.produtos} value={produtoId} onChange={setProdutoId}/></Campo><Campo rotulo="Quantidade"><Input required min="1" step="1" type="number" value={qtd} onChange={e => setQtd(e.target.value)}/></Campo><Campo rotulo="Cliente (opcional)"><Input value={cliente} onChange={e => setCliente(e.target.value)}/></Campo>{produto && <p className="text-sm">Total: {moeda(numero(produto.preco || 0) * numero(qtd || 0))}</p>}<Button disabled={salvando || !produtoId || produto?.preco == null}>Registrar venda</Button></form></Secao>
      <Secao titulo="Registrar despesa"><form className="space-y-3" onSubmit={async e => { e.preventDefault(); if (await executar("despesa.registrar", { descricao: despesa.descricao, valor: numero(despesa.valor), categoria: despesa.categoria })) setDespesa({ descricao: "", valor: "", categoria: "materiais" }); }}><Campo rotulo="Descrição"><Input required value={despesa.descricao} onChange={e => setDespesa({ ...despesa, descricao: e.target.value })}/></Campo><Campo rotulo="Valor (R$)"><Input required type="number" min="0.01" step="0.01" value={despesa.valor} onChange={e => setDespesa({ ...despesa, valor: e.target.value })}/></Campo><Campo rotulo="Categoria"><select className="h-9 w-full rounded-md border bg-background px-3" value={despesa.categoria} onChange={e => setDespesa({ ...despesa, categoria: e.target.value })}>{["materiais", "marketing", "equipamentos", "outros"].map(c => <option key={c} value={c}>{renomear(c)}</option>)}</select></Campo><Button disabled={salvando}>Registrar despesa</Button></form></Secao>
      </div>
      <Secao titulo="Últimas transações"><div className="space-y-2">{[...dados.vendas.map(v => ({ id: v.id, data: v.criadaEm, nome: v.quantidade + " × " + v.nomeProduto, valor: numero(v.total) })), ...dados.despesas.map(d => ({ id: d.id, data: d.criadaEm, nome: d.descricao, valor: -numero(d.valor) }))].filter(t => correspondeBusca(query, t.nome, t.valor, t.data)).sort((a,b) => b.data.localeCompare(a.data)).slice(0,20).map(t => <div key={t.id} className="flex justify-between gap-3 border-b py-2 text-sm"><span>{dataBR(t.data)} — {t.nome}</span><span className="whitespace-nowrap font-semibold">{moeda(t.valor)}</span></div>)}</div></Secao>
    </>}
    {aba === "relatorios" && <>
      <Secao titulo="Período"><Campo rotulo="Mês (vazio para todos os lançamentos carregados)"><Input type="month" value={periodo} onChange={e => setPeriodo(e.target.value)}/></Campo><p className="text-xs text-muted-foreground">Relatórios exibem até os 1.000 lançamentos mais recentes por tipo. Para relatórios históricos completos, a consulta paginada deve ser implementada.</p></Secao>
      <div className="grid gap-4 sm:grid-cols-4">{[["Produtos vendidos", vendasPeriodo.reduce((s, v) => s + v.quantidade, 0).toString()], ["Receita", moeda(vendasPeriodo.reduce((s,v) => s + numero(v.total),0))], ["Despesas", moeda(despesasPeriodo.reduce((s,d) => s + numero(d.valor),0))], ["Saldo", moeda(vendasPeriodo.reduce((s,v) => s + numero(v.total),0) - despesasPeriodo.reduce((s,d) => s + numero(d.valor),0))]].map(([l,v]) => <Card key={l}><CardContent className="pt-5"><p className="text-xs text-muted-foreground">{l}</p><p className="mt-2 text-xl font-semibold">{v}</p></CardContent></Card>)}</div>
      <div className="grid gap-4 lg:grid-cols-2"><Secao titulo="Produtos mais vendidos">{Object.entries(vendasPeriodo.reduce<Record<string,{q:number,r:number}>>((acc,v) => { const x=acc[v.nomeProduto] || {q:0,r:0}; x.q+=v.quantidade;x.r+=numero(v.total);acc[v.nomeProduto]=x;return acc; },{})).sort((a,b)=>b[1].q-a[1].q).map(([nome,v]) => <div className="flex justify-between border-b py-2 text-sm" key={nome}><span>{nome} ({v.q})</span><span>{moeda(v.r)}</span></div>)}</Secao><Secao titulo="Despesas por categoria">{Object.entries(despesasPeriodo.reduce<Record<string,number>>((a,d) => {a[d.categoria]=(a[d.categoria]||0)+numero(d.valor); return a;},{})).map(([nome,valor]) => <div key={nome} className="flex justify-between border-b py-2 text-sm"><span>{renomear(nome)}</span><span>{moeda(valor)}</span></div>)}</Secao></div>
    </>}
  </div>;
}
