"use client";

import { QUALIDADE_WEBP } from "@/config/upload";

export function converterParaWebp(
  arquivo: File,
  qualidade = QUALIDADE_WEBP,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo);
    const imagem = new window.Image();

    imagem.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = imagem.naturalWidth;
      canvas.height = imagem.naturalHeight;
      const contexto = canvas.getContext("2d");

      if (!contexto) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas indisponível neste navegador."));
        return;
      }

      contexto.drawImage(imagem, 0, 0);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error("Não foi possível converter a imagem."));
            return;
          }
          const nome = arquivo.name.replace(/\.[^.]+$/, "") + ".webp";
          resolve(new File([blob], nome, { type: "image/webp" }));
        },
        "image/webp",
        qualidade,
      );
    };

    imagem.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler a imagem."));
    };

    imagem.src = url;
  });
}
