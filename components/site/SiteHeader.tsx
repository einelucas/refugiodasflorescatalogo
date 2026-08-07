"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

// Distância de scroll (em px) até o header terminar de encolher.
// Curta o suficiente pra busca virar sticky rápido, longa o
// suficiente pra não parecer um corte abrupto.
const DISTANCIA_COLAPSO = 220;

export function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const alturaCheiaRef = useRef(0);
  const paddingCheiaRef = useRef({ topo: 0, base: 0 });

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    let quadroAgendado = false;

    function aplicarProgresso() {
      quadroAgendado = false;
      const progresso = Math.min(1, Math.max(0, window.scrollY / DISTANCIA_COLAPSO));
      const fator = 1 - progresso;
      // O padding não encolhe sozinho com max-height (não é
      // "conteúdo"), então sem interpolar ele também a caixa nunca
      // fica menor que padding-top + padding-bottom somados.
      header!.style.maxHeight = `${alturaCheiaRef.current * fator}px`;
      header!.style.paddingTop = `${paddingCheiaRef.current.topo * fator}px`;
      header!.style.paddingBottom = `${paddingCheiaRef.current.base * fator}px`;
      header!.style.opacity = String(fator);
    }

    // Mede a altura e o padding "cheios" que os clamps responsivos
    // do CSS dariam ao header, tirando por um instante o controle
    // que o JS aplica (senão mediríamos os valores já encolhidos).
    // Refeito no resize pra acompanhar mudança de viewport/orientação.
    function medirAlturaCheia() {
      header!.style.minHeight = "";
      header!.style.maxHeight = "none";
      header!.style.paddingTop = "";
      header!.style.paddingBottom = "";
      const estilo = getComputedStyle(header!);
      paddingCheiaRef.current = {
        topo: parseFloat(estilo.paddingTop),
        base: parseFloat(estilo.paddingBottom),
      };
      alturaCheiaRef.current = header!.getBoundingClientRect().height;
      header!.style.minHeight = "0px";
      aplicarProgresso();
    }

    function aoRolar() {
      if (!quadroAgendado) {
        quadroAgendado = true;
        requestAnimationFrame(aplicarProgresso);
      }
    }

    medirAlturaCheia();

    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", medirAlturaCheia, { passive: true });
    return () => {
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", medirAlturaCheia);
    };
  }, []);

  return (
    <header ref={headerRef} className="site-header">
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
