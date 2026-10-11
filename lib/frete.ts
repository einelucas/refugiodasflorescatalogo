/* =========================================================
   Regras de frete sem dependência de servidor ou navegador.
   A cotação na Frenet fica em lib/frenet.ts (só servidor).
   ========================================================= */

import { ENTREGA_LOCAL } from "@/config/frete";
import { normalizarTexto } from "./texto";

/// Endereços de Dourados/MS não são cotados: a entrega é própria e o
/// valor é combinado pelo WhatsApp.
export function ehEntregaLocal(cidade: string, uf: string): boolean {
  return normalizarTexto(cidade) === ENTREGA_LOCAL.cidade && uf === ENTREGA_LOCAL.uf;
}
