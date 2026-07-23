/* =========================================================
   POST /api/calcular-frete — rota pública (Frenet).

   Princípio mantido do projeto original: peso, dimensões e
   valor declarado NUNCA vêm do navegador. O corpo aceita
   apenas produtoId, quantidade e CEP; o resto vem do banco.
   Sem isso, qualquer pessoa forjaria um pacote de 1 g para
   baratear o frete.
   ========================================================= */

import { db } from "@/lib/db";
import { cotarFrete } from "@/lib/frenet";
import { calcularFretePublicoSchema } from "@/lib/validacao";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    let corpo: unknown;
    try {
      corpo = await request.json();
    } catch {
      return Response.json({ erro: "Corpo da requisição inválido." }, { status: 400 });
    }

    const parsed = calcularFretePublicoSchema.safeParse(corpo);
    if (!parsed.success) {
      return Response.json(
        { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 },
      );
    }

    const { produtoId, quantidade, cepDestino } = parsed.data;

    const produto = await db.produto.findFirst({
      where: { id: produtoId, ativo: true },
      select: {
        pesoKg: true,
        alturaCm: true,
        larguraCm: true,
        comprimentoCm: true,
        preco: true,
        valorDeclarado: true,
        freteHabilitado: true,
        sobConsulta: true,
      },
    });

    if (!produto) {
      return Response.json({ erro: "Produto não encontrado." }, { status: 404 });
    }

    if (produto.sobConsulta || !produto.freteHabilitado) {
      return Response.json(
        { erro: "Este produto é sob consulta. Fale conosco pelo WhatsApp para combinar o envio." },
        { status: 400 },
      );
    }

    const unitario = Number(produto.valorDeclarado ?? produto.preco ?? 0);

    const resultado = await cotarFrete({
      dimensoes: {
        pesoKg: Number(produto.pesoKg),
        alturaCm: Number(produto.alturaCm),
        larguraCm: Number(produto.larguraCm),
        comprimentoCm: Number(produto.comprimentoCm),
      },
      quantidade,
      valorDeclarado: Number((unitario * quantidade).toFixed(2)),
      cepDestino,
    });

    if (!resultado.ok) {
      return Response.json({ erro: resultado.erro }, { status: resultado.status });
    }

    return Response.json({ opcoes: resultado.opcoes, aviso: resultado.aviso });
  } catch (erro) {
    console.error("[calcular-frete] erro inesperado:", erro);
    return Response.json({ erro: "Erro interno ao calcular o frete." }, { status: 500 });
  }
}
