"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { toast } from "sonner";
import { PASTA_UPLOAD_PRODUTOS } from "@/config/upload";
import { erroArquivoImagem } from "@/lib/admin/produto/formulario";
import { converterParaWebp } from "@/lib/client/converter-para-webp";

export function useProductImages({
  onAdd,
  onRemove,
}: {
  onAdd: (url: string) => void;
  onRemove: (index: number) => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function uploadImage(file: File) {
    const validationError = erroArquivoImagem(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setUploading(true);
    try {
      let uploadFile = file;
      if (file.type !== "image/webp") {
        try {
          uploadFile = await converterParaWebp(file);
        } catch (conversionError) {
          console.warn(
            "[upload] conversão pra WebP falhou, enviando original:",
            conversionError,
          );
        }
      }

      const extension = uploadFile.type.split("/")[1].replace("jpeg", "jpg");
      const pathname = `${PASTA_UPLOAD_PRODUTOS}${crypto.randomUUID()}.${extension}`;
      const blob = await upload(pathname, uploadFile, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
      });

      onAdd(blob.url);
      toast.success("Imagem enviada.");
    } catch (error) {
      console.error("[upload] falha no navegador:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar a imagem. Tente novamente.",
      );
    } finally {
      setUploading(false);
    }
  }

  return { uploading, uploadImage, removeImage: onRemove };
}

export type ProductImagesState = ReturnType<typeof useProductImages>;
