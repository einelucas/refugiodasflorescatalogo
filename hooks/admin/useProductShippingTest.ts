"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { criarPayloadTesteFrete } from "@/lib/admin/produto/formulario";
import { testarFreteProduto } from "@/lib/client/testar-frete-produto";
import { mascararCEP } from "@/lib/utils";
import type { OpcaoFrete, ProdutoForm } from "@/types";

const CEP_TESTE_PADRAO = "01001-000";

export function useProductShippingTest({
  produto,
  onVerified,
}: {
  produto: ProdutoForm;
  onVerified: () => void;
}) {
  const [cep, setCep] = useState(CEP_TESTE_PADRAO);
  const [testing, setTesting] = useState(false);
  const [options, setOptions] = useState<OpcaoFrete[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestVersion = useRef(0);

  function invalidate() {
    requestVersion.current += 1;
    setTesting(false);
    setOptions(null);
    setError(null);
  }

  function changeCep(value: string) {
    setCep(mascararCEP(value));
    invalidate();
  }

  async function testShipping() {
    const currentVersion = requestVersion.current + 1;
    requestVersion.current = currentVersion;
    setTesting(true);
    setError(null);
    setOptions(null);

    const result = await testarFreteProduto(criarPayloadTesteFrete(produto, cep));
    if (requestVersion.current !== currentVersion) return;

    if (result.ok) {
      setOptions(result.opcoes);
      onVerified();
      toast.success("Frete calculado. Medidas marcadas como conferidas.");
    } else {
      setError(result.erro);
    }
    setTesting(false);
  }

  return {
    cep,
    testing,
    options,
    error,
    changeCep,
    testShipping,
    invalidate,
  };
}

export type ProductShippingTestState = ReturnType<typeof useProductShippingTest>;
