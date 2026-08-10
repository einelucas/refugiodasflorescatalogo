/* =========================================================
   POST /api/admin/testar-frete — EXIGE SESSÃO DE ADMIN.

   Única rota que aceita dimensões vindas do corpo. Existe para
   o botão "Testar frete" do formulário: a cliente digita as
   medidas e confere o resultado ANTES de salvar.

   Sem o teste, uma dimensão errada só aparece semanas depois,
   quando um comprador reclama. Com ele, aparece na hora.
   ========================================================= */

import { exigirAdmin } from "@/lib/auth";
import { cotarFrete } from "@/lib/frenet";
import { testarFreteSchema } from "@/lib/validacao";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const sessao = await exigirAdmin();
  if (!sessao) return Response.json({ erro: "Não autorizado." }, { status: 401 });

  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    return Response.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  const parsed = testarFreteSchema.safeParse(corpo);
  if (!parsed.success) {
    return Response.json(
      { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  const { pesoKg, alturaCm, larguraCm, comprimentoCm, quantidade, valorDeclarado, cepDestino } =
    parsed.data;

  const resultado = await cotarFrete({
    itens: [{ dimensoes: { pesoKg, alturaCm, larguraCm, comprimentoCm }, quantidade }],
    valorDeclarado: Number((valorDeclarado * quantidade).toFixed(2)),
    cepDestino,
  });

  if (!resultado.ok) return Response.json({ erro: resultado.erro }, { status: resultado.status });
  return Response.json({ opcoes: resultado.opcoes, aviso: resultado.aviso });
}
