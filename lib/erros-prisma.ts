/* =========================================================
   Identificação de erros do Prisma sem depender do namespace
   `Prisma`, que muda de forma entre versões e não é exportado
   de maneira estável quando se usa driver adapters.

   Códigos usados:
     P2002 — violação de índice único (slug repetido)
     P2003 — violação de chave estrangeira (categoria inexistente)
     P2025 — registro não encontrado
   ========================================================= */

export function codigoPrisma(erro: unknown): string | null {
  if (typeof erro === "object" && erro !== null && "code" in erro) {
    const c = (erro as { code?: unknown }).code;
    if (typeof c === "string") return c;
  }
  return null;
}

/// As CHECK constraints do banco chegam como texto na mensagem,
/// não como código. Cobrem o que escapar da validação Zod.
export function violouConstraint(erro: unknown, nome: string): boolean {
  return String(erro).includes(nome);
}
