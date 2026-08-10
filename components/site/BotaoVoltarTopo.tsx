"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "@phosphor-icons/react";

// Só aparece depois que a pessoa já rolou um bom trecho — perto do
// ponto em que o header já sumiu e a busca virou sticky.
const LIMIAR_EXIBICAO = 480;

export function BotaoVoltarTopo() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    function aoRolar() {
      setVisivel(window.scrollY > LIMIAR_EXIBICAO);
    }
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  if (!visivel) return null;

  return (
    <button
      type="button"
      className="botao-voltar-topo"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Voltar ao topo"
    >
      <ArrowUp size={20} weight="bold" />
    </button>
  );
}
