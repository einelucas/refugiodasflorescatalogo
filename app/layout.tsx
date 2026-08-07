import type { Metadata } from "next";
import { Fraunces, Poppins } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import "./refugio.css";

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

export const metadata: Metadata = {
  title: "Refúgio das Flores",
  description:
    "Flores eternas feitas à mão. Buquês, chaveiros e presentes personalizados.",
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
