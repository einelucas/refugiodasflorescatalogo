import { db } from "@/lib/db";
import { SiteHeader } from "@/components/site/SiteHeader";
import { BotaoVoltarTopo } from "@/components/site/BotaoVoltarTopo";
import { CarrinhoProvider } from "@/components/site/CarrinhoContext";
import { HeroBanner } from "@/components/site/layout/HeroBanner";
import { SiteFooter } from "@/components/site/layout/SiteFooter";
import { buscarWhatsappLoja } from "@/lib/loja";
import { montarLinkWhatsApp } from "@/lib/whatsapp";

export const revalidate = 300;

const WHATSAPP_MESSAGE = "Olá, vim pelo catálogo e gostaria de mais informações!";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [paginas, whatsapp] = await Promise.all([
    db.pagina.findMany({
      where: { visivelNoMenu: true },
      orderBy: { ordem: "asc" },
      select: { slug: true, titulo: true },
    }),
    buscarWhatsappLoja(),
  ]);

  return (
    <CarrinhoProvider>
      <div className="public-site">
        <SiteHeader />
        <HeroBanner />

        {children}

        <SiteFooter
          whatsappUrl={montarLinkWhatsApp(whatsapp, WHATSAPP_MESSAGE)}
          paginas={paginas}
        />
        <BotaoVoltarTopo />
      </div>
    </CarrinhoProvider>
  );
}
