# Migração Refúgio ADM para Next.js

Implementação na branch `feat/refugio-gestao-20261019`, sem alterar o catálogo público.

## Módulos incluídos
- Estoque de matérias-primas: cadastro, edição, exclusão e busca.
- Fichas técnicas dos produtos do catálogo: ingredientes e quantidades.
- Produção: consumo atômico de matérias-primas e histórico.
- Financeiro: vendas manuais, despesas, saldo (receita menos despesas), transações recentes.
- Relatórios: totais, produtos mais vendidos e despesas por categoria, com filtro de mês.

## Separação de responsabilidades
O cadastro de produtos do catálogo continua sendo a fonte única para nomes e preços. A produção consome matéria-prima; o registro de venda **não** consome novamente (evita a baixa duplicada presente em uma integração ingênua dos módulos antigos). Ainda não existe estoque de produtos acabados: a produção registra a operação e sua matéria-prima consumida.

## Segurança
As telas usam `/admin/*` e o middleware atual. A API `/api/admin/gestao` exige a sessão administrativa em GET e POST, incluindo operações de gravação. O catálogo público não expõe dados financeiros.

## Banco e publicação
Migração incremental: `prisma/migrations/20261019000000_gestao_interna/migration.sql`. Executar `npm run db:deploy` antes de ativar as telas em produção e testar `npm run build`, `npm test` e fluxos de estoque e financeiro. Fazer backup do Neon antes da migração. A migração não apaga as tabelas existentes.

## Dependências pendentes para a substituição completa do sistema antigo
- Os dados históricos do Firebase (coleções `stock`, `products`, `sales`, `expenses`) **não foram copiados**: importar a partir de exportação autorizada do Firestore, com checagem de duplicidade, chaves e conciliação antes de desativar o sistema antigo.
- Produtos cadastrados no Firebase devem ser conciliados com os já existentes no catálogo; evitar duplicatas.
- A consulta atual traz 1.000 vendas e 1.000 despesas recentes, 500 produções. Relatório para grandes volumes precisa de agregação SQL paginada no servidor.
- Exportação de relatório em PDF do sistema antigo ainda não foi migrada.
- Testar em ambiente conectado ao Neon antes de liberar alterações financeiras; esta branch ainda não foi validada por build/CI.

## Próximas verificações
1. Executar migração em cópia do banco, gerar cliente Prisma e validar build.
2. Testar decremento concorrente e rollback da produção sem saldo.
3. Testar autorização das rotas e navegação mobile.
4. Conciliar/importar registros Firebase, validar totais históricos.
5. Publicar somente após aprovação e CI verde.
