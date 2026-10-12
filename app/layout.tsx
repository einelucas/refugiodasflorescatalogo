import type { Metadata, Viewport } from "next";
import { Fraunces, Poppins } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
// CSS do site público, dividido por responsabilidade (ordem em index.css).
import "@/styles/site/index.css";

const bodyFont = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

const displayFont = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const SITE_NOME = "Refúgio das Flores";
const SITE_DESCRICAO =
  "Flores eternas feitas à mão. Buquês, chaveiros e presentes personalizados.";

/// URL pública usada para montar os links absolutos das prévias (og:image,
/// canonical). Na Vercel cai no domínio de produção automaticamente.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

// A imagem de prévia (app/opengraph-image.png), o favicon (app/icon.svg) e o
// ícone da tela inicial do iPhone (app/apple-icon.png) são detectados pelo
// Next a partir dos arquivos — não precisam ser listados aqui.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NOME, template: `%s — ${SITE_NOME}` },
  description: SITE_DESCRICAO,
  applicationName: SITE_NOME,
  keywords: [
    "flores eternas",
    "buquê",
    "buquês personalizados",
    "chaveiros",
    "presentes personalizados",
    "flores feitas à mão",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: SITE_NOME,
    title: SITE_NOME,
    description: SITE_DESCRICAO,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NOME,
    description: SITE_DESCRICAO,
  },
};

export const viewport: Viewport = {
  themeColor: "#5a1e72",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
