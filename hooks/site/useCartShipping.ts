"use client";

/* =========================================================
   Frete consolidado do carrinho.

   Diferente de useProductShipping (um produto só), cota todos
   os itens numa única chamada. Uma cotação vale só para o
   carrinho, o CEP e a classificação de entrega local em que
   foi feita: se qualquer um muda, ela é descartada — inclusive
   uma resposta que ainda estava a caminho.
   ========================================================= */

import { useEffect, useRef, useState } from "react";
import { cotarFreteCarrinho } from "@/lib/client/cotar-frete-carrinho";
import { chaveCotacaoCarrinho } from "@/lib/checkout/cotacao";
import { cepCompleto } from "@/lib/checkout/validacao";
import { ehEntregaLocal } from "@/lib/frete";
import type { ItemCarrinho, OpcaoFrete } from "@/types";

type Cotacao = {
  chave: string;
  opcoes: OpcaoFrete[] | null;
  escolhida: OpcaoFrete | null;
  freteLocal: boolean;
};

export function useCartShipping({
  itens,
  cep,
  cidade,
  estado,
}: {
  itens: ItemCarrinho[];
  cep: string;
  cidade: string;
  estado: string;
}) {
  const [calculando, setCalculando] = useState(false);
  const [erroFrete, setErroFrete] = useState<string | null>(null);
  const [cotacao, setCotacao] = useState<Cotacao | null>(null);
  const versaoRequisicao = useRef(0);

  const local = ehEntregaLocal(cidade, estado);
  const chave = chaveCotacaoCarrinho(itens, cep, local);

  // Só exibe a cotação se ela ainda corresponde ao carrinho atual —
  // evita mostrar um frete velho no render entre a mudança e o efeito
  // abaixo.
  const atual = cotacao?.chave === chave ? cotacao : null;

  function invalidarCotacao() {
    versaoRequisicao.current += 1;
    setCalculando(false);
    setCotacao(null);
  }

  // Carrinho, CEP ou entrega local mudaram: cotação (e requisição em
  // andamento) deixam de valer.
  useEffect(() => {
    versaoRequisicao.current += 1;
    setCalculando(false);
    setCotacao(null);
  }, [chave]);

  async function calcularFrete() {
    const limpo = cep.replace(/\D/g, "");
    if (!cepCompleto(cep)) {
      setErroFrete("Digite um CEP com 8 dígitos.");
      return;
    }
    if (itens.length === 0) return;

    const versaoAtual = versaoRequisicao.current + 1;
    versaoRequisicao.current = versaoAtual;
    setCalculando(true);
    setErroFrete(null);
    setCotacao(null);

    // Endereço já foi buscado (autofill do CEP) — usa direto, sem
    // nova chamada ao ViaCEP.
    if (local) {
      setCotacao({ chave, opcoes: null, escolhida: null, freteLocal: true });
      setCalculando(false);
      return;
    }

    const resultado = await cotarFreteCarrinho(itens, limpo);
    if (versaoRequisicao.current !== versaoAtual) return;

    if (resultado.ok) {
      setCotacao({
        chave,
        opcoes: resultado.opcoes,
        escolhida: resultado.opcoes[0],
        freteLocal: false,
      });
    } else {
      setErroFrete(resultado.erro);
    }
    setCalculando(false);
  }

  function selecionarOpcao(opcao: OpcaoFrete) {
    setCotacao((anterior) => (anterior ? { ...anterior, escolhida: opcao } : anterior));
  }

  return {
    calculando,
    erroFrete,
    opcoes: atual?.opcoes ?? null,
    escolhida: atual?.escolhida ?? null,
    freteLocal: atual?.freteLocal ?? false,
    calcularFrete,
    selecionarOpcao,
    invalidarCotacao,
  };
}

export type CartShippingState = ReturnType<typeof useCartShipping>;
