/* =========================================================
   Migração do site antigo para o Neon.

       npm run db:seed:dry     # relatório, não grava
       npm run db:seed         # grava

   Sobre a qualidade dos dados: peso e dimensões vêm do projeto
   antigo, onde vários estavam marcados "TODO: COLOCAR_PESO_AQUI".
   São estimativas. Todos entram com medidasVerificadas = false
   e o painel os destaca até a revisão.

   Dois ajustes automáticos, ambos reportados no final:
   · dimensões abaixo do mínimo dos Correios são elevadas ao piso
     (senão a CHECK constraint rejeita e o produto não migra);
   · preço "A consultar" vira sobConsulta = true, preço nulo.
   ========================================================= */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PRODUTOS_LEGADO, CATEGORIAS_LEGADO } from "./dados-legado";

const db = new PrismaClient();
const DRY = process.env.DRY_RUN === "1";

const MIN = { altura: 2, largura: 11, comprimento: 16 } as const;
const SOMA_MAX = 200;

function precoParaNumero(texto: string): number | null {
  if (/consultar|encomenda/i.test(texto)) return null;
  const limpo = texto.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(limpo);
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function main() {
  console.log(DRY ? "── DRY RUN — nada será gravado ──\n" : "── GRAVANDO ──\n");

  const ajustes: string[] = [];
  const semPreco: string[] = [];

  // 1) Categorias
  const mapa = new Map<string, string>();
  for (const c of CATEGORIAS_LEGADO) {
    if (DRY) {
      mapa.set(c.nome, "dry");
      continue;
    }
    const criada = await db.categoria.upsert({
      where: { slug: c.slug },
      update: { nome: c.nome, titulo: c.titulo, subtitulo: c.subtitulo, aliases: c.aliases, ordem: c.ordem },
      create: { ...c, ativa: true },
    });
    mapa.set(c.nome, criada.id);
  }
  console.log(`categorias: ${CATEGORIAS_LEGADO.length}`);

  // 2) Embalagens padrão, a partir dos tamanhos mais recorrentes.
  //    Evita que a cliente redigite dimensões a cada cadastro.
  const embalagensPadrao = [
    { nome: "Buquê grande", altura: 46, largura: 24, comprimento: 24, tara: 0.12 },
    { nome: "Buquê médio", altura: 40, largura: 20, comprimento: 20, tara: 0.1 },
    { nome: "Buquê pequeno", altura: 35, largura: 16, comprimento: 16, tara: 0.08 },
    { nome: "Caixa pequena (chaveiro/flor)", altura: 6, largura: 12, comprimento: 16, tara: 0.05 },
  ];
  if (!DRY) {
    for (const e of embalagensPadrao) {
      const existe = await db.embalagem.findFirst({ where: { nome: e.nome } });
      if (existe) continue;
      await db.embalagem.create({
        data: {
          nome: e.nome,
          alturaCm: e.altura,
          larguraCm: e.largura,
          comprimentoCm: e.comprimento,
          pesoTaraKg: e.tara,
        },
      });
    }
  }
  console.log(`embalagens: ${embalagensPadrao.length}`);

  // 3) Produtos
  let migrados = 0;
  const semCategoria: string[] = [];

  for (const [i, p] of PRODUTOS_LEGADO.entries()) {
    const categoriaId = mapa.get(p.categoria);
    if (!categoriaId) {
      semCategoria.push(`${p.nome} (categoria "${p.categoria}")`);
      continue;
    }

    // Piso das dimensões
    let { altura, largura, comprimento, peso } = p;
    const original = `${altura}×${largura}×${comprimento}`;
    altura = Math.max(altura, MIN.altura);
    largura = Math.max(largura, MIN.largura);
    comprimento = Math.max(comprimento, MIN.comprimento);
    if (peso <= 0) peso = 0.1;

    if (`${altura}×${largura}×${comprimento}` !== original) {
      ajustes.push(`${p.nome}: ${original} → ${altura}×${largura}×${comprimento} cm`);
    }

    // Teto da soma: reduz proporcionalmente, preservando os mínimos.
    let soma = altura + largura + comprimento;
    if (soma > SOMA_MAX) {
      const fator = SOMA_MAX / soma;
      altura = Math.max(MIN.altura, Math.floor(altura * fator));
      largura = Math.max(MIN.largura, Math.floor(largura * fator));
      comprimento = Math.max(MIN.comprimento, Math.floor(comprimento * fator));
      ajustes.push(`${p.nome}: soma ${soma} cm acima do limite, reduzida`);
    }

    const preco = precoParaNumero(p.precoTexto);
    const sobConsulta = preco === null;
    if (sobConsulta) semPreco.push(p.nome);

    if (DRY) {
      migrados++;
      continue;
    }

    await db.produto.create({
      data: {
        categoriaId,
        nome: p.nome,
        descricao: p.descricao || null,
        preco,
        sobConsulta,
        badge: p.badge || null,
        pesoKg: peso,
        alturaCm: altura,
        larguraCm: largura,
        comprimentoCm: comprimento,
        valorDeclarado: p.valorDeclarado,
        // Nenhuma medida foi conferida com a caixa na mão.
        medidasVerificadas: false,
        // Sem preço fixo não há como cotar frete: vai para o WhatsApp.
        freteHabilitado: !sobConsulta,
        ordem: i,
        ativo: true,
        imagens: {
          create: p.imagens.map((url, k) => ({ url, alt: p.nome, ordem: k })),
        },
      },
    });
    migrados++;
  }

  // 4) Admin inicial
  const email = process.env.ADMIN_EMAIL;
  const senha = process.env.ADMIN_SENHA;
  if (email && senha && !DRY) {
    await db.usuario.upsert({
      where: { email: email.toLowerCase() },
      update: {},
      create: {
        email: email.toLowerCase(),
        senhaHash: await bcrypt.hash(senha, 12),
        nome: "Administradora",
        papel: "admin",
      },
    });
    console.log(`\nadmin criado: ${email}`);
  } else if (!DRY) {
    console.log("\n⚠️  ADMIN_EMAIL/ADMIN_SENHA não definidos — nenhum login criado.");
  }

  // 5) Relatório
  console.log(`\n── Resumo ──`);
  console.log(`produtos migrados: ${migrados}/${PRODUTOS_LEGADO.length}`);
  console.log(`medidas a revisar no painel: ${migrados} (todas)`);

  if (ajustes.length) {
    console.log(`\nDIMENSÕES AJUSTADAS AO MÍNIMO DOS CORREIOS (${ajustes.length}):`);
    ajustes.forEach((a) => console.log(`  · ${a}`));
    console.log(`  → o frete calcula, mas o valor só fica correto após a revisão.`);
  }
  if (semPreco.length) {
    console.log(`\nSEM PREÇO FIXO — marcados "sob consulta" (${semPreco.length}):`);
    semPreco.forEach((n) => console.log(`  · ${n}`));
  }
  if (semCategoria.length) {
    console.log(`\nCATEGORIA DESCONHECIDA — não migrados (${semCategoria.length}):`);
    semCategoria.forEach((n) => console.log(`  · ${n}`));
  }

  console.log(`\nAs imagens ainda apontam para caminhos relativos do repositório`);
  console.log(`antigo. Copie a pasta imagens/ para public/ ou reenvie pelo painel.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
