-- =========================================================
-- Constraints que o schema.prisma não expressa.
--
-- O Zod protege o formulário; a constraint protege o dado
-- contra scripts de seed, correções manuais no banco e
-- qualquer caminho que não passe pelo painel.
--
-- Mínimos dos Correios (pacote): 16 × 11 × 2 cm, soma ≤ 200.
-- Abaixo disso a transportadora recusa e o cliente final vê
-- "frete indisponível" sem entender o motivo.
-- =========================================================

ALTER TABLE "produtos"
  ADD CONSTRAINT "produtos_dimensoes_minimas" CHECK (
    "peso_kg" > 0
    AND "peso_kg" <= 30
    AND "altura_cm" >= 2
    AND "largura_cm" >= 11
    AND "comprimento_cm" >= 16
    AND ("altura_cm" + "largura_cm" + "comprimento_cm") <= 200
  );

-- Produto sem preço só é válido se marcado como "sob consulta".
-- Cobre o "Presente Premium Sob Encomenda", que no site antigo
-- tinha preço "A consultar" como texto.
-- Atenção ao NULL: em SQL, um CHECK só rejeita quando a expressão
-- é explicitamente FALSE. `preco > 0` com preco NULL avalia como
-- NULL, não FALSE — então a linha passaria. Por isso o
-- "preco IS NOT NULL" explícito no segundo ramo.
ALTER TABLE "produtos"
  ADD CONSTRAINT "produtos_preco_coerente" CHECK (
    ("sob_consulta" = true AND "preco" IS NULL)
    OR ("sob_consulta" = false AND "preco" IS NOT NULL AND "preco" > 0)
  );

ALTER TABLE "produtos"
  ADD CONSTRAINT "produtos_valor_declarado_positivo" CHECK (
    "valor_declarado" IS NULL OR "valor_declarado" > 0
  );

ALTER TABLE "embalagens"
  ADD CONSTRAINT "embalagens_dimensoes_minimas" CHECK (
    "altura_cm" >= 2
    AND "largura_cm" >= 11
    AND "comprimento_cm" >= 16
    AND ("altura_cm" + "largura_cm" + "comprimento_cm") <= 200
  );
