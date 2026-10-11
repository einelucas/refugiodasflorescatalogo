/// Faixa de apresentação abaixo do cabeçalho: foto de fundo (via CSS,
/// em .hero-banner), slogan, categorias e o aviso de envio nacional.
export function HeroBanner() {
  return (
    <div className="hero-banner">
      <div className="hero-banner-glow" />
      <div className="hero-banner-inner">
        <p className="brand-tagline">Flores eternas feitas à mão</p>
        <p className="brand-sub">Buquês · Chaveiros · Presentes Personalizados</p>
        <p className="brand-delivery">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/imagens/express-delivery.png" alt="" className="delivery-icon" />
          Enviamos para todo o Brasil
        </p>
      </div>
    </div>
  );
}
