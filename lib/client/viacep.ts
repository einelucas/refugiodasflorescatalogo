import type { EnderecoViaCep } from "@/types";

type ConsultarViaCepOptions = {
  validarRespostaHttp?: boolean;
  signal?: AbortSignal;
};

export async function consultarViaCep(
  cep: string,
  { validarRespostaHttp = false, signal }: ConsultarViaCepOptions = {},
): Promise<EnderecoViaCep> {
  const cepLimpo = cep.replace(/\D/g, "");
  const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`, { signal });
  const dados: EnderecoViaCep = await resposta.json();

  if (validarRespostaHttp && !resposta.ok) {
    throw new Error("Falha ao consultar o ViaCEP.");
  }

  return {
    logradouro: dados.logradouro ?? "",
    bairro: dados.bairro ?? "",
    localidade: dados.localidade ?? "",
    uf: (dados.uf ?? "").toUpperCase(),
    // O ViaCEP responde `"erro": "true"` (string) para CEP inexistente —
    // por isso a checagem é por valor truthy, como no código original.
    erro: Boolean(dados.erro),
  };
}
