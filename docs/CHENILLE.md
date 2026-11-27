# Chenille no catálogo

Motor Canvas 2D independente, sem novas dependências. O banner recebe flores pré-renderizadas e sublinhado progressivo. A seção após o catálogo usa scroll nativo e quatro etapas. Não há introdução bloqueante: a compra e o carregamento inicial têm prioridade.

## Validação local
- npm ci
- npm run build
- npx tsc --noEmit
- npm test
- npm run dev
- O projeto de origem não declara script de lint nem dependência ESLint.
- Testar 360, 390, 768, 1024 e 1440 px; mouse, touch, scroll, visibilidade da aba, reduced motion, busca, filtros, modal de produto, carrinho e autenticação/admin.
- O build e o catálogo completo requerem as configurações de banco e demais variáveis do projeto.

O cache é limitado a 96 tufos; cada instância de banner prepara os sprites uma vez por DPR (máximo 2). IntersectionObserver e visibilitychange interrompem o loop; ResizeObserver atualiza as dimensões. A história redesenha sob demanda por scroll, resize ou mudança da preferência de movimento. Sem JavaScript, as quatro descrições continuam no HTML.
