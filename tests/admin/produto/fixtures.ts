import type { Embalagem, ProdutoForm } from "@/types";

export const PRODUTO: ProdutoForm = {
  id: "produto-1",
  nome: "Buquê Aurora",
  categoriaId: "11111111-1111-4111-8111-111111111111",
  descricao: "Descrição",
  preco: 149.9,
  sobConsulta: false,
  badge: "Novo",
  pesoKg: 1.25,
  alturaCm: 20,
  larguraCm: 30,
  comprimentoCm: 40,
  valorDeclarado: 120,
  freteHabilitado: true,
  medidasVerificadas: true,
  ordem: 2,
  ativo: true,
  imagens: [
    { url: "https://example.com/a.webp", alt: "Frente" },
    { url: "https://example.com/b.webp", alt: null },
  ],
};

export const EMBALAGEM: Embalagem = {
  id: "embalagem-1",
  nome: "Caixa média",
  alturaCm: 18,
  larguraCm: 25,
  comprimentoCm: 35,
  pesoTaraKg: 0.2,
};
