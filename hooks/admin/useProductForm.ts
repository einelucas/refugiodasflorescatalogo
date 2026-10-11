"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  aplicarEmbalagemAoProduto,
  atualizarCampoProduto,
  criarPayloadProduto,
  criarProdutoInicial,
} from "@/lib/admin/produto/formulario";
import type { CategoriaOpcao, Embalagem, ProdutoForm } from "@/types";

export function useProductForm({
  categorias,
  embalagens,
  inicial,
}: {
  categorias: CategoriaOpcao[];
  embalagens: Embalagem[];
  inicial?: ProdutoForm;
}) {
  const router = useRouter();
  const [produto, setProduto] = useState<ProdutoForm>(
    () => inicial ?? criarProdutoInicial(categorias),
  );
  const [salvando, setSalvando] = useState(false);

  function atualizarCampo<K extends keyof ProdutoForm>(campo: K, valor: ProdutoForm[K]) {
    setProduto((atual) => atualizarCampoProduto(atual, campo, valor));
  }

  function aplicarEmbalagem(id: string): boolean {
    const embalagem = embalagens.find((item) => item.id === id);
    if (!embalagem) return false;
    setProduto((atual) => aplicarEmbalagemAoProduto(atual, embalagem));
    toast.info(
      `Medidas de "${embalagem.nome}" aplicadas. Confirme o peso e teste o frete.`,
    );
    return true;
  }

  function adicionarImagem(url: string) {
    setProduto((atual) => ({
      ...atual,
      imagens: [...atual.imagens, { url, alt: atual.nome }],
    }));
  }

  function removerImagem(indice: number) {
    setProduto((atual) => ({
      ...atual,
      imagens: atual.imagens.filter((_, posicao) => posicao !== indice),
    }));
  }

  async function salvar() {
    setSalvando(true);
    try {
      const url = produto.id
        ? `/api/admin/produtos/${produto.id}`
        : "/api/admin/produtos";
      const resposta = await fetch(url, {
        method: produto.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(criarPayloadProduto(produto)),
      });
      const dados: { erro?: string } = await resposta.json();
      if (!resposta.ok) {
        toast.error(dados.erro ?? "Não foi possível salvar.");
        return;
      }
      toast.success("Produto salvo.");
      router.push("/admin/produtos");
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  return {
    produto,
    salvando,
    atualizarCampo,
    aplicarEmbalagem,
    adicionarImagem,
    removerImagem,
    marcarMedidasVerificadas: () =>
      setProduto((atual) => ({ ...atual, medidasVerificadas: true })),
    salvar,
    cancelar: () => router.push("/admin/produtos"),
  };
}

export type ProductFormState = ReturnType<typeof useProductForm>;
