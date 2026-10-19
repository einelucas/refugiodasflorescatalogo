-- Gestão de estoque, ficha técnica, produção e financeiro (sem modificar dados legados).
CREATE TABLE "materias_primas" (
  "id" UUID PRIMARY KEY,
  "nome" TEXT NOT NULL UNIQUE,
  "quantidade" DECIMAL(12,3) NOT NULL DEFAULT 0,
  "unidade" TEXT NOT NULL DEFAULT 'un',
  CONSTRAINT "materias_primas_quantidade_positiva" CHECK ("quantidade" >= 0)
);

CREATE TABLE "fichas_tecnicas" (
  "produto_id" UUID NOT NULL REFERENCES "produtos"("id") ON DELETE CASCADE,
  "materia_prima_id" UUID NOT NULL REFERENCES "materias_primas"("id") ON DELETE RESTRICT,
  "quantidade" DECIMAL(12,3) NOT NULL,
  PRIMARY KEY ("produto_id", "materia_prima_id"),
  CONSTRAINT "fichas_tecnicas_quantidade_positiva" CHECK ("quantidade" > 0)
);

CREATE TABLE "producoes" (
  "id" UUID PRIMARY KEY,
  "produto_id" UUID NOT NULL REFERENCES "produtos"("id") ON DELETE RESTRICT,
  "nome_produto" TEXT NOT NULL,
  "quantidade" INTEGER NOT NULL,
  "criada_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "producoes_quantidade_positiva" CHECK ("quantidade" > 0)
);
CREATE INDEX "producoes_criada_em_idx" ON "producoes"("criada_em");

CREATE TABLE "vendas" (
  "id" UUID PRIMARY KEY,
  "produto_id" UUID NOT NULL REFERENCES "produtos"("id") ON DELETE RESTRICT,
  "nome_produto" TEXT NOT NULL,
  "quantidade" INTEGER NOT NULL,
  "preco_unitario" DECIMAL(10,2) NOT NULL,
  "total" DECIMAL(12,2) NOT NULL,
  "cliente" TEXT,
  "criada_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "vendas_quantidade_positiva" CHECK ("quantidade" > 0),
  CONSTRAINT "vendas_total_positivo" CHECK ("total" >= 0)
);
CREATE INDEX "vendas_criada_em_idx" ON "vendas"("criada_em");

CREATE TABLE "despesas" (
  "id" UUID PRIMARY KEY,
  "descricao" TEXT NOT NULL,
  "valor" DECIMAL(12,2) NOT NULL,
  "categoria" TEXT NOT NULL,
  "criada_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "despesas_valor_positivo" CHECK ("valor" > 0)
);
CREATE INDEX "despesas_criada_em_idx" ON "despesas"("criada_em");
