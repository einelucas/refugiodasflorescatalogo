# Novo layout do painel administrativo — Refúgio das Flores

## Referência
Inspirado nas proporções e composição de `frontend/components/AppHeader.vue` e `frontend/components/TabsNav.vue`, do repositório `centraldeindicadores-inp`.

## Componentização
- `AdminShell`: compõe o layout comum a todas as rotas privadas.
- `AdminHeader`: marca Refúgio, contexto da aba, botão **Ver catálogo**, botão **Sair** e pesquisa.
- `AdminTabsNav` + `AdminTabsNavItem`: barra arredondada com navegação por ícones, estado ativo, nome acessível e dica de ferramenta nativa ao passar o mouse.
- `AdminSearchProvider`, `AdminSearchField`, `AdminSearchEmptyState`: estado e interface de pesquisa única; limpo ao trocar de rota.
- `NAV_ADMIN`: fonte única de navegação já utilizada pelas novas abas.

## Identidade visual
Mantém a logo do catálogo e os tokens do Refúgio (`--primary`, `--muted`, rosa/roxo), sem copiar a paleta industrial.
A barra de ícones possui o destaque suave e os cantos arredondados da referência.
O cabeçalho é responsivo, com busca central em desktop e campo próprio abaixo da marca em telas pequenas.
O login público do admin não recebe o cabeçalho.

## Busca
Pesquisa reativa no módulo aberto:
- Produtos: nome, categoria, preço e estado.
- Categorias: nome, título, slug e aliases.
- Páginas: título e slug.
- Embalagens: nome e dimensões.
- Estoque: matérias-primas e unidade.
- Produção: histórico de produções.
- Financeiro: histórico de transações.
- Relatórios: produtos e despesas dentro do período selecionado.

A busca é local ao conjunto de dados já carregado na aba e não realiza consultas globais ao banco. No Financeiro e em Relatórios, o painel legado de gestão continua limitado aos registros trazidos por sua API (até mil por tipo), inclusive para a busca.

## Validação
Executar `npm test`, `npm run build` e conferência responsiva com um usuário admin válido antes do merge em produção. Mudanças não exigem migração de banco.
