/* =========================================================
   POST /api/admin/upload — imagens para o Vercel Blob.
   Resolve o problema de hoje: as fotos vivem no repositório e
   a cliente não tem como subir novas sem um commit.
   ========================================================= */

import { put } from "@vercel/blob";
import { exigirAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const TAMANHO_MAX = 6 * 1024 * 1024;

export async function POST(request: Request) {
  const sessao = await exigirAdmin();
  if (!sessao) return Response.json({ erro: "Não autorizado." }, { status: 401 });

  const form = await request.formData();
  const arquivo = form.get("arquivo");

  if (!(arquivo instanceof File)) {
    return Response.json({ erro: "Nenhum arquivo enviado." }, { status: 400 });
  }
  if (!TIPOS_ACEITOS.includes(arquivo.type)) {
    return Response.json({ erro: "Use JPG, PNG, WebP ou AVIF." }, { status: 400 });
  }
  if (arquivo.size > TAMANHO_MAX) {
    return Response.json({ erro: "Imagem muito grande. Máximo 6 MB." }, { status: 400 });
  }

  // Nome aleatório: evita colisão e impede que o nome original
  // (com acentos, espaços ou caminho) vire URL.
  const extensao = arquivo.type.split("/")[1].replace("jpeg", "jpg");
  const nome = `produtos/${crypto.randomUUID()}.${extensao}`;

  try {
    const blob = await put(nome, arquivo, { access: "public", contentType: arquivo.type });
    return Response.json({ url: blob.url });
  } catch (erro) {
    console.error("[upload] falha:", erro);
    return Response.json({ erro: "Não foi possível enviar a imagem." }, { status: 500 });
  }
}
