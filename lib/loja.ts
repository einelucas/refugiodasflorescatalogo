/* =========================================================
   Configurações da loja lidas do banco. Só servidor.
   ========================================================= */

import { WHATSAPP_LOJA_PADRAO } from "@/config/loja";
import { db } from "./db";

/// Número do WhatsApp da loja: configuração do banco, depois a
/// variável WHATSAPP_LOJA, depois o número padrão.
export async function buscarWhatsappLoja(): Promise<string> {
  const config = await db.configuracao.findUnique({ where: { chave: "whatsappLoja" } });
  return (config?.valor as string) ?? process.env.WHATSAPP_LOJA ?? WHATSAPP_LOJA_PADRAO;
}
