import { db } from "@/lib/db";
import { Catalogo } from "@/components/site/Catalogo";

export const revalidate = 60;

function normalizarUrlImagem(url: string) {
  if (/^(https?:)?\/\//i.test(url) || url.startsWith("data:")) return url;
  return url.startsWith("/") ? url : `/${url}`;
}

export default async function HomePage() {
  const [categorias, config] = await Promise.all([
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
    db.configuracao.findUnique({ where: { chave: "whatsappLoja" } }),
  ]);

  const whatsapp = (config?.valor as string) ?? process.env.WHATSAPP_LOJA ?? "556796072932";

  return (
    <Catalogo
      whatsapp={whatsapp}
      categorias={categorias.map((categoria) => ({
        id: categoria.id,
        nome: categoria.nome,
        slug: categoria.slug,
        titulo: categoria.titulo,
        subtitulo: categoria.subtitulo,
        produtos: categoria.produtos.map((produto) => ({
          id: produto.id,
          nome: produto.nome,
          descricao: produto.descricao,
          preco: produto.preco === null ? null : Number(produto.preco),
          sobConsulta: produto.sobConsulta,
          badge: produto.badge,
          freteHabilitado: produto.freteHabilitado,
          imagens: produto.imagens.map((imagem) => ({
            url: normalizarUrlImagem(imagem.url),
            alt: imagem.alt ?? produto.nome,
          })),
        })),
      }))}
    />
  );
}
