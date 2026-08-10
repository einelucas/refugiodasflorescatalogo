"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ItemCarrinho = { produtoId: string; quantidade: number };

const CHAVE_STORAGE = "refugio:carrinho";
const QUANTIDADE_MAXIMA = 10;

type CarrinhoContextValor = {
  itens: ItemCarrinho[];
  totalItens: number;
  aberto: boolean;
  adicionar: (produtoId: string, quantidade?: number) => void;
  remover: (produtoId: string) => void;
  definirQuantidade: (produtoId: string, quantidade: number) => void;
  limpar: () => void;
  abrirCarrinho: () => void;
  fecharCarrinho: () => void;
};

const CarrinhoContext = createContext<CarrinhoContextValor | null>(null);

export function CarrinhoProvider({ children }: { children: React.ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [aberto, setAberto] = useState(false);
  const [carregado, setCarregado] = useState(false);

  // O storage só existe no navegador — carrega uma vez após montar.
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_STORAGE);
      if (salvo) setItens(JSON.parse(salvo));
    } catch {
      // Dado corrompido ou localStorage indisponível: segue com carrinho vazio.
    }
    setCarregado(true);
  }, []);

  useEffect(() => {
    // Evita sobrescrever o storage com [] antes do carregamento inicial acima.
    if (!carregado) return;
    try {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(itens));
    } catch {
      // Ex.: modo privado sem quota — o carrinho continua funcionando na sessão.
    }
  }, [itens, carregado]);

  const adicionar = useCallback((produtoId: string, quantidade = 1) => {
    setItens((atual) => {
      const existente = atual.find((item) => item.produtoId === produtoId);
      if (existente) {
        return atual.map((item) =>
          item.produtoId === produtoId
            ? { ...item, quantidade: Math.min(QUANTIDADE_MAXIMA, item.quantidade + quantidade) }
            : item,
        );
      }
      return [...atual, { produtoId, quantidade: Math.min(QUANTIDADE_MAXIMA, quantidade) }];
    });
  }, []);

  const remover = useCallback((produtoId: string) => {
    setItens((atual) => atual.filter((item) => item.produtoId !== produtoId));
  }, []);

  const definirQuantidade = useCallback((produtoId: string, quantidade: number) => {
    setItens((atual) => {
      if (quantidade <= 0) return atual.filter((item) => item.produtoId !== produtoId);
      return atual.map((item) =>
        item.produtoId === produtoId
          ? { ...item, quantidade: Math.min(QUANTIDADE_MAXIMA, quantidade) }
          : item,
      );
    });
  }, []);

  const limpar = useCallback(() => setItens([]), []);
  const abrirCarrinho = useCallback(() => setAberto(true), []);
  const fecharCarrinho = useCallback(() => setAberto(false), []);

  const totalItens = useMemo(
    () => itens.reduce((soma, item) => soma + item.quantidade, 0),
    [itens],
  );

  const valor = useMemo<CarrinhoContextValor>(
    () => ({
      itens,
      totalItens,
      aberto,
      adicionar,
      remover,
      definirQuantidade,
      limpar,
      abrirCarrinho,
      fecharCarrinho,
    }),
    [itens, totalItens, aberto, adicionar, remover, definirQuantidade, limpar, abrirCarrinho, fecharCarrinho],
  );

  return <CarrinhoContext.Provider value={valor}>{children}</CarrinhoContext.Provider>;
}

export function useCarrinho() {
  const contexto = useContext(CarrinhoContext);
  if (!contexto) throw new Error("useCarrinho precisa ser usado dentro de <CarrinhoProvider>.");
  return contexto;
}
