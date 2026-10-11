"use client";

import { toast } from "sonner";
import { formatarBRL } from "@/lib/utils";
import type { ProdutoCatalogo } from "@/types";

export async function compartilharProduto(produto: ProdutoCatalogo) {
  const url = `${window.location.origin}/?produto=${produto.id}`;
  const texto = produto.sobConsulta
    ? produto.nome
    : `${produto.nome} — ${formatarBRL(produto.preco)}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `${produto.nome} — Refúgio das Flores`,
        text: texto,
        url,
      });
      return;
    } catch (erro) {
      if ((erro as Error)?.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    toast.success("Link do produto copiado!");
  } catch {
    toast.error("Não foi possível copiar o link.");
  }
}
