import sanitizeHtml from "sanitize-html";

const OPCOES_HTML_INSTITUCIONAL: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "h2",
    "h3",
    "h4",
    "ul",
    "ol",
    "li",
    "blockquote",
    "a",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowProtocolRelative: false,
  transformTags: {
    a: (_tagName, attribs) => ({
      tagName: "a",
      attribs:
        attribs.target === "_blank"
          ? { ...attribs, rel: "noopener noreferrer" }
          : attribs,
    }),
  },
};

/**
 * Mantém somente a formatação necessária às páginas institucionais.
 * Deve ser aplicada na escrita e novamente na leitura para proteger
 * registros criados antes da introdução da sanitização.
 */
export function sanitizarHtmlInstitucional(html: string): string {
  return sanitizeHtml(html, OPCOES_HTML_INSTITUCIONAL);
}
