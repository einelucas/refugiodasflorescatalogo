"use client";

import { useRef, useState } from "react";
import { ehEntregaLocal } from "@/lib/frete";
import { consultarViaCep } from "@/lib/client/viacep";
import { mascararCEP } from "@/lib/utils";
import type { OpcaoFrete, RespostaFrete } from "@/types";

export function useProductShipping(produtoId: string, quantidade: number) {
  const [cep, setCep] = useState("");
  const [calculando, setCalculando] = useState(false);
  const [opcoes, setOpcoes] = useState<OpcaoFrete[] | null>(null);
  const [escolhida, setEscolhida] = useState<OpcaoFrete | null>(null);
  const [erroFrete, setErroFrete] = useState<string | null>(null);
  const [freteLocal, setFreteLocal] = useState(false);
  const versaoRequisicao = useRef(0);

  function invalidarCotacao() {
    versaoRequisicao.current += 1;
    setCalculando(false);
    setOpcoes(null);
    setEscolhida(null);
  }

  function alterarCep(valor: string) {
    versaoRequisicao.current += 1;
    setCalculando(false);
    setCep(mascararCEP(valor));
    setOpcoes(null);
    setEscolhida(null);
    setFreteLocal(false);
  }

  async function calcularFrete() {
    const limpo = cep.replace(/\D/g, "");
    if (limpo.length !== 8) {
      setErroFrete("Digite um CEP com 8 dígitos.");
      return;
    }

    const versaoAtual = versaoRequisicao.current + 1;
    versaoRequisicao.current = versaoAtual;
    setCalculando(true);
    setErroFrete(null);
    setOpcoes(null);
    setEscolhida(null);
    setFreteLocal(false);

    try {
      let cidadeDetectada = "";
      let estadoDetectado = "";

      try {
        const dadosCep = await consultarViaCep(limpo);
        if (versaoRequisicao.current !== versaoAtual) return;
        if (!dadosCep.erro) {
          cidadeDetectada = dadosCep.localidade ?? "";
          estadoDetectado = dadosCep.uf ?? "";
        }
      } catch {
        // Sem resposta do ViaCEP: segue para a cotação normal.
      }

      if (versaoRequisicao.current !== versaoAtual) return;
      if (ehEntregaLocal(cidadeDetectada, estadoDetectado)) {
        setFreteLocal(true);
        return;
      }

      const resposta = await fetch("/api/calcular-frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itens: [{ produtoId, quantidade }],
          cepDestino: limpo,
        }),
      });
      const dados: RespostaFrete = await resposta.json();

      if (versaoRequisicao.current !== versaoAtual) return;
      if (!resposta.ok) {
        setErroFrete(dados.erro ?? "Não foi possível calcular o frete.");
        return;
      }
      if (!dados.opcoes?.length) {
        setErroFrete(dados.aviso ?? "Nenhuma opção de entrega para este CEP.");
        return;
      }

      setOpcoes(dados.opcoes);
      setEscolhida(dados.opcoes[0]);
    } catch {
      if (versaoRequisicao.current === versaoAtual) {
        setErroFrete("Erro de conexão. Tente novamente.");
      }
    } finally {
      if (versaoRequisicao.current === versaoAtual) {
        setCalculando(false);
      }
    }
  }

  return {
    cep,
    calculando,
    opcoes,
    escolhida,
    erroFrete,
    freteLocal,
    alterarCep,
    calcularFrete,
    invalidarCotacao,
    selecionarOpcao: setEscolhida,
  };
}
