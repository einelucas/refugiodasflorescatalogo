import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Catalogo } from "@/components/site/Catalogo";
import { normalizarUrlImagem, serializarCategoriaCatalogo } from "@/lib/catalogo";
import { buscarWhatsappLoja } from "@/lib/loja";
import { formatarBRL } from "@/lib/utils";

export const revalidate = 60;

type PropsPagina = {
  searchParams: Promise<{ produto?: string }>;
};

/// Quando o link traz ?produto=<id> (compartilhado via WhatsApp, por
/// exemplo), a prévia mostra o buquê específico — nome, preço e foto —
/// em vez da descrição genérica da loja.
export async function generateMetadata({ searchParams }: PropsPagina): Promise<Metadata> {
  const { produto: produtoId } = await searchParams;
  if (!produtoId) return {};

  const produto = await db.produto.findFirst({
    where: { id: produtoId, ativo: true },
    include: { imagens: { orderBy: { ordem: "asc" }, take: 1 } },
  });
  if (!produto) return {};

  const preco = produto.sobConsulta ? "sob consulta" : formatarBRL(Number(produto.preco));
  const titulo = `${produto.nome} — Refúgio das Flores`;
  const descricao = `${preco} · ${produto.descricao ?? "Flores eternas feitas à mão."}`;
  const imagem = produto.imagens[0] ? normalizarUrlImagem(produto.imagens[0].url) : undefined;

  return {
    title: { absolute: titulo },
    description: descricao,
    openGraph: {
      title: titulo,
      description: descricao,
      images: imagem ? [{ url: imagem }] : undefined,
    },
  };
}

export default async function HomePage({ searchParams }: PropsPagina) {
  const { produto: produtoInicialId } = await searchParams;
  const [categorias, whatsapp] = await Promise.all([
    db.categoria.findMany({
      where: { ativa: true },
      orderBy: { ordem: "asc" },
      include: {
        produtos: {
          where: { ativo: true },
          orderBy: { ordem: "asc" },
          include: { imagens: { orderBy: { ordem: "asc" } } },
        },
      },
    }),
    buscarWhatsappLoja(),
  ]);

  return (
    <Catalogo
      whatsapp={whatsapp}
      produtoInicialId={produtoInicialId}
      categorias={categorias.map(serializarCategoriaCatalogo)}
    />
  );
}
