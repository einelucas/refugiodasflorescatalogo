/// Remove acentos, passa para minúsculas e apara as pontas.
/// Base da busca do catálogo e da geração de slugs.
export function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
