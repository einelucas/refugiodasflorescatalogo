"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Depois desse tanto de scroll (em px) o header some, dando lugar
// à barra de busca fixa no topo — sem precisar rolar a página
// inteira de novo pra achar o campo de pesquisa.
const LIMIAR_SCROLL = 80;

export function SiteHeader() {
  const [encolhido, setEncolhido] = useState(false);

  useEffect(() => {
    function aoRolar() {
      setEncolhido(window.scrollY > LIMIAR_SCROLL);
    }
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  return (
    <header className={`site-header ${encolhido ? "site-header--encolhido" : ""}`}>
      <div className="header-glow" />
      <div className="header-inner">
        <Link href="/" className="logo-wrap" aria-label="Ir para o início">
          <span className="logo-ring">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/imagens/logo-refugio.svg" alt="" className="logo-svg" />
          </span>
        </Link>

        <h1 className="brand-name">Refúgio das Flores</h1>
        <p className="brand-tagline">Flores eternas feitas à mão</p>
        <p className="brand-sub">Buquês · Chaveiros · Presentes Personalizados</p>
        <p className="brand-delivery">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/imagens/express-delivery.png" alt="" className="delivery-icon" />
          Enviamos para todo o Brasil
        </p>
      </div>

      <div className="petal petal-1">✿</div>
      <div className="petal petal-2">✾</div>
      <div className="petal petal-3">❀</div>
      <div className="petal petal-4">✿</div>
      <div className="petal petal-5">✾</div>
    </header>
  );
}
