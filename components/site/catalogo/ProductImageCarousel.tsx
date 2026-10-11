"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import type { ImagemCatalogo } from "@/types";

const PLACEHOLDER_BLUR =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F5DDEB"/><stop offset="1" stop-color="#D9B3D9"/></linearGradient></defs><rect width="12" height="12" fill="url(#g)"/></svg>`,
  );

type ProductImageCarouselProps = {
  images: ImagemCatalogo[];
  variant?: "card" | "modal";
  children?: ReactNode;
};

export function ProductImageCarousel({
  images,
  variant = "card",
  children,
}: ProductImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const image = images[index];
  const isModal = variant === "modal";
  const prefix = isModal ? "modal" : "card";

  function navigate(direction: number) {
    setIndex((current) => (current + direction + images.length) % images.length);
  }

  return (
    <div className={`${prefix}-img-wrap`}>
      {!isModal && children}

      {image ? (
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes={
            isModal
              ? "(min-width: 1180px) 560px, 92vw"
              : "(min-width: 1180px) 23vw, (min-width: 640px) 30vw, 45vw"
          }
          placeholder="blur"
          blurDataURL={PLACEHOLDER_BLUR}
        />
      ) : (
        <div className="img-placeholder">🌸</div>
      )}

      {isModal && children}

      {images.length > 1 && (
        <>
          <button
            type="button"
            className={`${prefix}-carousel-arrow ${prefix}-carousel-arrow--left`}
            onClick={(event) => {
              event.stopPropagation();
              navigate(-1);
            }}
            aria-label="Imagem anterior"
          >
            <CaretLeft size={18} weight="bold" />
          </button>
          <button
            type="button"
            className={`${prefix}-carousel-arrow ${prefix}-carousel-arrow--right`}
            onClick={(event) => {
              event.stopPropagation();
              navigate(1);
            }}
            aria-label="Próxima imagem"
          >
            <CaretRight size={18} weight="bold" />
          </button>
          <div
            className={isModal ? "image-dots modal-image-dots" : "image-dots"}
            aria-hidden="true"
          >
            {images.map((_, position) => (
              <span key={position} className={position === index ? "active" : ""} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
