# Abertura pré-renderizada (experimento de desempenho)

A home mantém o splash antes da hidratação, a repetição em novos carregamentos,
o botão de pular e a preferência por movimento reduzido. O buquê 3D não foi
substituído.

## Gerar e testar

```sh
npm ci
npm run intro:render
npm run dev
```

`predev` e `prebuild` executam o mesmo gerador automaticamente. As dependências
nativas de renderização estão isoladas em scripts/intro-render, sem entrar no
bundle do navegador. A assinatura SHA-256 evita regenerar o vídeo quando os
arquivos de entrada não mudaram. A geração usa o SVG oficial, o material e o
motion já existentes. O resultado é um MP4 H.264 de 640×640, 30 FPS, seis segundos,
sem áudio, com fast-start e um poster PNG. Os arquivos gerados ficam em public/imagens.

O player é muted/playsInline. Se o arquivo não carregar em 2,5 s ou a reprodução
falhar, a abertura é encerrada, sem bloquear indefinidamente o catálogo.
O banner e o buquê não executam seus canvases enquanto o splash estiver ativo.

## Validação pendente

- Executar a geração, verificar o tamanho real e reproduzir o MP4.
- Rodar npm test e npm run build.
- Testar o carregamento inicial em Chrome/Android e Safari/iOS, com rede
  normal/lenta, e confirmar que não há flash do catálogo nem borda visível.
- Comparar a duração real, tarefas longas e uso de CPU com a versão Canvas.
- Validar que os recursos públicos são incluídos no deploy antes de mesclar.

O preview da Vercel retornou limite de builds durante esta implementação.
