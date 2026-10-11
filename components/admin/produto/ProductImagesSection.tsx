"use client";

import { Trash2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { TIPOS_IMAGEM_ACEITOS } from "@/config/upload";
import type { ProductImagesState } from "@/hooks/admin/useProductImages";
import type { ImagemForm } from "@/types";

type ProductImagesSectionProps = {
  images: ImagemForm[];
  productName: string;
  imageState: ProductImagesState;
};

export function ProductImagesSection({
  images,
  productName,
  imageState,
}: ProductImagesSectionProps) {
  return (
    <div className="space-y-2 sm:col-span-2">
      <Label>Fotos</Label>
      <div className="flex flex-wrap gap-3">
        {images.map((image, index) => (
          <div key={image.url + index} className="group relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.alt ?? productName}
              loading="lazy"
              className="h-20 w-20 rounded-md border object-cover"
            />
            {index === 0 && (
              <Badge className="absolute -top-2 -left-1 scale-90" variant="secondary">
                capa
              </Badge>
            )}
            <button
              type="button"
              onClick={() => imageState.removeImage(index)}
              className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remover foto"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
        <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed text-xs text-muted-foreground hover:bg-accent">
          <Upload className="h-4 w-4" />
          {imageState.uploading ? "…" : "Enviar"}
          <input
            type="file"
            accept={TIPOS_IMAGEM_ACEITOS.join(",")}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void imageState.uploadImage(file);
              event.target.value = "";
            }}
          />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">
        A primeira foto aparece no card do catálogo.
      </p>
    </div>
  );
}
