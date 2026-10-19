import { Box, FileText, FolderTree, Package, Boxes, Hammer, Wallet, ChartColumnIncreasing, type LucideIcon } from "lucide-react";

export type ItemNavegacaoAdmin = { href: string; rotulo: string; Icone: LucideIcon };

/// Fonte única dos links do painel (cabeçalho desktop e menu mobile).
export const NAV_ADMIN: ItemNavegacaoAdmin[] = [
  { href: "/admin/produtos", rotulo: "Produtos", Icone: Package },
  { href: "/admin/categorias", rotulo: "Categorias", Icone: FolderTree },
  { href: "/admin/paginas", rotulo: "Páginas", Icone: FileText },
  { href: "/admin/embalagens", rotulo: "Embalagens", Icone: Box },
  { href: "/admin/estoque", rotulo: "Estoque", Icone: Boxes },
  { href: "/admin/producao", rotulo: "Produção", Icone: Hammer },
  { href: "/admin/financeiro", rotulo: "Financeiro", Icone: Wallet },
  { href: "/admin/relatorios", rotulo: "Relatórios", Icone: ChartColumnIncreasing },
];

export const URL_CATALOGO = "https://refugiodasflorescatalogo.vercel.app";

/// A seção fica ativa na própria rota e em qualquer sub-rota
/// (ex.: /admin/produtos/novo destaca "Produtos").
export function itemAtivo(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
