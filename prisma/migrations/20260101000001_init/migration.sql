-- =========================================================
-- Criação das tabelas.
-- Esta migração precisa vir ANTES de 20260101000002_constraints_frete,
-- que apenas adiciona CHECK constraints às tabelas criadas aqui.
-- =========================================================

-- CreateTable
CREATE TABLE "categorias" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "subtitulo" TEXT,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "icone_url" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" UUID NOT NULL,
    "categoria_id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" DECIMAL(10,2),
    "badge" TEXT,
    "peso_kg" DECIMAL(6,3) NOT NULL,
    "largura_cm" DECIMAL(6,1) NOT NULL,
    "altura_cm" DECIMAL(6,1) NOT NULL,
    "comprimento_cm" DECIMAL(6,1) NOT NULL,
    "valor_declarado" DECIMAL(10,2),
    "frete_habilitado" BOOLEAN NOT NULL DEFAULT true,
    "medidas_verificadas" BOOLEAN NOT NULL DEFAULT false,
    "sob_consulta" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produto_imagens" (
    "id" UUID NOT NULL,
    "produto_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "produto_imagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "embalagens" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "largura_cm" DECIMAL(6,1) NOT NULL,
    "altura_cm" DECIMAL(6,1) NOT NULL,
    "comprimento_cm" DECIMAL(6,1) NOT NULL,
    "peso_tara_kg" DECIMAL(6,3) NOT NULL DEFAULT 0,

    CONSTRAINT "embalagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paginas" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo_html" TEXT,
    "visivel_no_menu" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "paginas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes" (
    "chave" TEXT NOT NULL,
    "valor" JSONB NOT NULL,

    CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("chave")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "papel" TEXT NOT NULL DEFAULT 'admin',
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_slug_key" ON "categorias"("slug");

-- CreateIndex
CREATE INDEX "categorias_ativa_ordem_idx" ON "categorias"("ativa", "ordem");

-- CreateIndex
CREATE INDEX "produtos_categoria_id_ativo_ordem_idx" ON "produtos"("categoria_id", "ativo", "ordem");

-- CreateIndex
CREATE INDEX "produtos_ativo_idx" ON "produtos"("ativo");

-- CreateIndex
CREATE INDEX "produto_imagens_produto_id_ordem_idx" ON "produto_imagens"("produto_id", "ordem");

-- CreateIndex
CREATE UNIQUE INDEX "paginas_slug_key" ON "paginas"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
-- Restrict: apagar uma categoria com produtos deixaria produtos órfãos.
-- A rota DELETE de categorias desativa em vez de apagar.
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_categoria_id_fkey"
    FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
-- Cascade: as imagens não fazem sentido sem o produto.
ALTER TABLE "produto_imagens" ADD CONSTRAINT "produto_imagens_produto_id_fkey"
    FOREIGN KEY ("produto_id") REFERENCES "produtos"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
