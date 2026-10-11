"use client";

/* =========================================================
   Estado do formulário de checkout do carrinho: comprador,
   endereço (com preenchimento pelo ViaCEP), pagamento,
   observações e validação antes do envio.
   ========================================================= */

import { useRef, useState } from "react";
import { consultarViaCep } from "@/lib/client/viacep";
import { cepCompleto, checkoutValido } from "@/lib/checkout/validacao";
import { mascararCEP, mascararTelefone } from "@/lib/utils";
import type {
  CampoEndereco,
  DadosCliente,
  EnderecoEntrega,
  FormaPagamento,
  StatusCep,
} from "@/types";

const ENDERECO_VAZIO: EnderecoEntrega = {
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
};

export function useCheckout(quantidadeItens: number) {
  const [cliente, setCliente] = useState<DadosCliente>({ nome: "", telefone: "" });
  const [endereco, setEndereco] = useState<EnderecoEntrega>(ENDERECO_VAZIO);
  const [observacoes, setObservacoes] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("pix");
  const [parcelas, setParcelas] = useState(1);
  const [statusCep, setStatusCep] = useState<StatusCep>("idle");
  const [tentouEnviar, setTentouEnviar] = useState(false);
  // Cada CEP digitado invalida a consulta anterior ao ViaCEP: uma
  // resposta atrasada não sobrescreve o endereço de um CEP mais novo.
  const versaoConsultaCep = useRef(0);

  async function buscarEndereco(cep: string) {
    const versaoAtual = versaoConsultaCep.current;
    setStatusCep("buscando");
    try {
      const dados = await consultarViaCep(cep, { validarRespostaHttp: true });
      if (versaoConsultaCep.current !== versaoAtual) return;

      if (dados.erro) {
        setStatusCep("erro");
        return;
      }

      setEndereco((atual) => ({
        ...atual,
        rua: dados.logradouro ?? "",
        bairro: dados.bairro ?? "",
        cidade: dados.localidade ?? "",
        estado: dados.uf ?? "",
      }));
      setStatusCep("sucesso");
    } catch {
      if (versaoConsultaCep.current === versaoAtual) setStatusCep("erro");
    }
  }

  function alterarCep(valor: string) {
    const mascarado = mascararCEP(valor);
    versaoConsultaCep.current += 1;
    setEndereco((atual) => ({ ...atual, cep: mascarado }));
    if (cepCompleto(mascarado)) {
      void buscarEndereco(mascarado);
    } else {
      setStatusCep("idle");
    }
  }

  function alterarCampoEndereco(campo: CampoEndereco, valor: string) {
    setEndereco((atual) => ({
      ...atual,
      [campo]: campo === "estado" ? valor.toUpperCase() : valor,
    }));
  }

  const formularioValido = checkoutValido({ cliente, endereco, quantidadeItens });

  /// Libera o envio se o formulário estiver completo; senão passa a
  /// mostrar o aviso de campos obrigatórios.
  function confirmarEnvio(): boolean {
    if (!formularioValido) {
      setTentouEnviar(true);
      return false;
    }
    return true;
  }

  return {
    cliente,
    endereco,
    observacoes,
    formaPagamento,
    parcelas,
    statusCep,
    formularioValido,
    mostrarErroValidacao: tentouEnviar && !formularioValido,
    alterarNome: (nome: string) => setCliente((atual) => ({ ...atual, nome })),
    alterarTelefone: (telefone: string) =>
      setCliente((atual) => ({ ...atual, telefone: mascararTelefone(telefone) })),
    alterarCep,
    alterarCampoEndereco,
    alterarObservacoes: setObservacoes,
    alterarFormaPagamento: setFormaPagamento,
    alterarParcelas: setParcelas,
    confirmarEnvio,
  };
}

export type CheckoutState = ReturnType<typeof useCheckout>;
