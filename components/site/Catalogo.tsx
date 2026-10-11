"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { normalizarTexto } from "@/lib/texto";
import type { CategoriaCatalogo, ProdutoComCategoria } from "@/types";
import { useCarrinho } from "./CarrinhoContext";
import { CartDrawer } from "./carrinho/CartDrawer";
import { CatalogEmptyState } from "./catalogo/CatalogEmptyState";
import { CatalogSearchBar } from "./catalogo/CatalogSearchBar";
import { CategoryFilter } from "./catalogo/CategoryFilter";
import { CategorySection } from "./catalogo/CategorySection";
import { ProductDetailModal } from "./produto/ProductDetailModal";

export function Catalogo({
  categorias,
  whatsapp,
  produtoInicialId,
}: {
  categorias: CategoriaCatalogo[];
  whatsapp: string;
  produtoInicialId?: string;
}) {
  const [filtro, setFiltro] = useState("todas");
  const [busca, setBusca] = useState("");
  const [expandido, setExpandido] = useState<string | null>(null);
  const [aberto, setAberto] = useState<ProdutoComCategoria | null>(null);
  const { adicionar, abrirCarrinho } = useCarrinho();

  // Link direto pra um produto (?produto=<id>, ex.: compartilhado pelo
  // WhatsApp): abre o modal desse item assim que a página carrega.
  useEffect(() => {
    if (!produtoInicialId) return;
    for (const categoria of categorias) {
      const produto = categoria.produtos.find((p) => p.id === produtoInicialId);
      if (produto) {
        setAberto({ produto, categoria: categoria.nome });
        return;
      }
    }
    // Não achou: o link é de um produto que já saiu do catálogo
    // (despublicado ou removido) — avisa em vez de não fazer nada.
    // Adiado: nesse primeiro efeito da página, o <Toaster> (renderizado
    // depois de {children} no layout) ainda pode não ter se inscrito
    // pra receber toasts — chamar direto perde o aviso.
    const id = setTimeout(() => toast.error("Esse produto não está mais disponível."), 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mantém a URL em sincronia com o modal aberto, pra dar pra
  // compartilhar/atualizar a página no produto certo — sem navegar de
  // verdade (evita refetch do server component a cada abrir/fechar).
  useEffect(() => {
    const url = new URL(window.location.href);
    if (aberto) {
      url.searchParams.set("produto", aberto.produto.id);
    } else {
      url.searchParams.delete("produto");
    }
    window.history.replaceState(null, "", url);
  }, [aberto]);

  const categoriasVisiveis = useMemo(() => {
    const termo = normalizarTexto(busca);

    return categorias
      .filter((categoria) => filtro === "todas" || categoria.slug === filtro)
      .map((categoria) => ({
        ...categoria,
        produtos: categoria.produtos.filter((produto) => {
          if (!termo) return true;
          return normalizarTexto(
            `${produto.nome} ${produto.descricao ?? ""} ${categoria.nome}`,
          ).includes(termo);
        }),
      }))
      .filter((categoria) => categoria.produtos.length > 0);
  }, [busca, categorias, filtro]);

  return (
    <main className="catalog-section">
      <div className="search-filter-bar">
        <CatalogSearchBar value={busca} onChange={setBusca} />
        <CategoryFilter
          categories={categorias}
          selectedCategory={filtro}
          onChange={setFiltro}
        />
      </div>

      <div className="catalog-container">
        {categoriasVisiveis.map((categoria) => (
          <CategorySection
            key={categoria.id}
            category={categoria}
            expandedProductId={expandido}
            onToggleProduct={(produto) =>
              setExpandido((id) => (id === produto.id ? null : produto.id))
            }
            onOpenProduct={(produto) => setAberto({ produto, categoria: categoria.nome })}
            onBuyProduct={(produto) => {
              adicionar(produto.id, 1);
              abrirCarrinho();
            }}
            onAddProductToCart={(produto) => {
              adicionar(produto.id, 1);
              toast.success(`${produto.nome} adicionado ao carrinho!`, {
                action: { label: "Ver carrinho", onClick: () => abrirCarrinho() },
              });
            }}
          />
        ))}
      </div>

      {categoriasVisiveis.length === 0 && <CatalogEmptyState />}

      {aberto && (
        <ProductDetailModal
          key={aberto.produto.id}
          product={aberto.produto}
          category={aberto.categoria}
          whatsapp={whatsapp}
          onClose={() => setAberto(null)}
        />
      )}

      <CartDrawer categorias={categorias} whatsapp={whatsapp} />
    </main>
  );
}
