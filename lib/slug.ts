import { normalizarTexto } from "./texto";

/// "Presentes Personalizados" → "presentes-personalizados"
export function gerarSlug(texto: string): string {
  return normalizarTexto(texto)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
