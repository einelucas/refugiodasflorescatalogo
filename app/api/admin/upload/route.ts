/* =========================================================
   POST /api/admin/upload — autorização para upload direto no
   Vercel Blob.

   O arquivo vai do navegador diretamente para o Blob. A rota
   apenas autentica o administrador e gera um token temporário,
   evitando o limite de 4,5 MB das Vercel Functions.
   ========================================================= */

import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { exigirAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const TAMANHO_MAX = 6 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody;

    const resposta = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const sessao = await exigirAdmin();
        if (!sessao) {
          throw new Error("Não autorizado.");
        }

        if (!pathname.startsWith("produtos/")) {
          throw new Error("Caminho de upload inválido.");
        }

        return {
          allowedContentTypes: TIPOS_ACEITOS,
          maximumSizeInBytes: TAMANHO_MAX,
          addRandomSuffix: false,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.info("[upload] concluído:", blob.url);
      },
    });

    return Response.json(resposta);
  } catch (erro) {
    console.error("[upload] falha:", erro);
    return Response.json(
      {
        erro:
          erro instanceof Error
            ? erro.message
            : "Não foi possível autorizar o envio da imagem.",
      },
      { status: 400 },
    );
  }
}
