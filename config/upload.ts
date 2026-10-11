/* =========================================================
   Upload de fotos de produto (Vercel Blob).
   Lidas tanto pela rota que autoriza o upload quanto pelo
   formulário do painel, que valida antes de enviar.
   ========================================================= */

export const TIPOS_IMAGEM_ACEITOS = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export const TAMANHO_MAXIMO_IMAGEM = 6 * 1024 * 1024;

/// Pasta do Blob onde ficam as fotos; a rota recusa qualquer outra.
export const PASTA_UPLOAD_PRODUTOS = "produtos/";

/// Qualidade da conversão para WebP feita no navegador (0–1).
export const QUALIDADE_WEBP = 0.85;
