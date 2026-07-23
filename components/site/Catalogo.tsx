"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, Truck, X } from "lucide-react";
import { formatarBRL, mascararCEP } from "@/lib/utils";

type Imagem = { url: string; alt: string };
type Produto = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number | null;
  sobConsulta: boolean;
  badge: string | null;
  freteHabilitado: boolean;
  imagens: Imagem[];
};
type Categoria = {
  id: string;
  nome: string;
  slug: string;
  titulo: string;
  subtitulo: string | null;
  produtos: Produto[];
};
type OpcaoFrete = {
  transportadora: string;
  servico: string;
  codigoServico: string;
  preco: number;
  prazoDias: number | null;
};

type ProdutoAberto = { produto: Produto; categoria: string };

const ICONES_CATEGORIA: Record<string, string> = {
  buques: "/imagens/bouquet-icon.png",
  unitarios: "/imagens/flower-icon-black.png",
  chaveiros: "/imagens/chaveiro-icon.png",
  presentes: "/imagens/giftbox-icon-black.png",
  "presentes-personalizados": "/imagens/giftbox-icon-black.png",
};

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function classeBadge(badge: string | null) {
  const valor = normalizar(badge ?? "").replace(/\s+/g, "-");
  if (valor.includes("mais-vendido")) return "badge-mais-vendido";
  if (valor.includes("novo")) return "badge-novo";
  if (valor.includes("promocao")) return "badge-promocao";
  return "";
}

function linkWhatsAppProduto(whatsapp: string, produto: Produto) {
  const mensagem = `Olá, tenho interesse em ${produto.nome}. Poderia me passar mais informações?`;
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function Catalogo({ categorias, whatsapp }: { categorias: Categoria[]; whatsapp: string }) {
  const [filtro, setFiltro] = useState("todas");
  const [busca, setBusca] = useState("");
  const [expandido, setExpandido] = useState<string | null>(null);
  const [aberto, setAberto] = useState<ProdutoAberto | null>(null);

  const categoriasVisiveis = useMemo(() => {
    const termo = normalizar(busca);

    return categorias
      .filter((categoria) => filtro === "todas" || categoria.slug === filtro)
      .map((categoria) => ({
        ...categoria,
        produtos: categoria.produtos.filter((produto) => {
          if (!termo) return true;
          return normalizar(
            `${produto.nome} ${produto.descricao ?? ""} ${categoria.nome}`,
          ).includes(termo);
        }),
      }))
      .filter((categoria) => categoria.produtos.length > 0);
  }, [busca, categorias, filtro]);

  useEffect(() => {
    if (!aberto) return;

    function fecharComEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAberto(null);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", fecharComEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", fecharComEscape);
    };
  }, [aberto]);

  return (
    <main className="catalog-section">
      <div className="search-filter-bar">
        <label className="search-wrap">
          <Search className="search-icon" aria-hidden="true" />
          <input
            type="search"
            className="search-input"
            placeholder="Buscar produto..."
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            aria-label="Buscar produto"
          />
        </label>

        <div className="filter-pills" role="group" aria-label="Filtrar por categoria">
          <FiltroBotao ativo={filtro === "todas"} onClick={() => setFiltro("todas")}>
            Todos
          </FiltroBotao>
          {categorias.map((categoria) => (
            <FiltroBotao
              key={categoria.id}
              ativo={filtro === categoria.slug}
              onClick={() => setFiltro(categoria.slug)}
              icone={ICONES_CATEGORIA[categoria.slug]}
            >
              {categoria.nome === "Presentes Personalizados" ? "Presentes" : categoria.nome}
            </FiltroBotao>
          ))}
        </div>
      </div>

      <div className="catalog-container">
        {categoriasVisiveis.map((categoria) => (
          <section key={categoria.id} className="category-section">
            <div className="category-header">
              <div>
                <h2>{categoria.titulo}</h2>
                {categoria.subtitulo && <p className="category-subtitle">{categoria.subtitulo}</p>}
              </div>
              <div className="category-line" />
            </div>

            <div className="products-grid">
              {categoria.produtos.map((produto) => (
                <CardProduto
                  key={produto.id}
                  produto={produto}
                  categoria={categoria.nome}
                  whatsapp={whatsapp}
                  expandido={expandido === produto.id}
                  onAlternar={() => setExpandido((id) => (id === produto.id ? null : produto.id))}
                  onAbrir={() => setAberto({ produto, categoria: categoria.nome })}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {categoriasVisiveis.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🌸</div>
          <p>Nenhum produto encontrado</p>
          <span>Tente outro termo ou categoria</span>
        </div>
      )}

      {aberto && (
        <div className="modal-overlay open" role="presentation" onMouseDown={() => setAberto(null)}>
          <div
            className="modal-card checkout-card"
            role="dialog"
            aria-modal="true"
            aria-label={`Detalhes de ${aberto.produto.nome}`}
            onMouseDown={(evento) => evento.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setAberto(null)} aria-label="Fechar">
              <X />
            </button>
            <DetalheProduto
              key={aberto.produto.id}
              produto={aberto.produto}
              categoria={aberto.categoria}
              whatsapp={whatsapp}
            />
          </div>
        </div>
      )}
    </main>
  );
}

function FiltroBotao({
  ativo,
  onClick,
  children,
  icone,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icone?: string;
}) {
  return (
    <button className={`pill ${ativo ? "active" : ""}`} onClick={onClick} type="button">
      {icone && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={icone} alt="" className="pill-icon" />
      )}
      {children}
    </button>
  );
}

function CardProduto({
  produto,
  categoria,
  whatsapp,
  expandido,
  onAlternar,
  onAbrir,
}: {
  produto: Produto;
  categoria: string;
  whatsapp: string;
  expandido: boolean;
  onAlternar: () => void;
  onAbrir: () => void;
}) {
  const [indice, setIndice] = useState(0);
  const imagem = produto.imagens[indice];

  function navegar(direcao: number) {
    setIndice((atual) => (atual + direcao + produto.imagens.length) % produto.imagens.length);
  }

  return (
    <article
      className={`product-card ${expandido ? "expanded" : ""}`}
      tabIndex={0}
      onClick={onAlternar}
      onKeyDown={(evento) => {
        if (evento.key === "Enter" || evento.key === " ") {
          evento.preventDefault();
          onAlternar();
        }
      }}
      aria-label={produto.nome}
    >
      <div className="card-img-wrap">
        {produto.badge && (
          <span className={`badge ${classeBadge(produto.badge)}`}>{produto.badge}</span>
        )}

        {imagem ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imagem.url} alt={imagem.alt} loading="lazy" />
        ) : (
          <div className="img-placeholder">🌸</div>
        )}

        {produto.imagens.length > 1 && (
          <>
            <button
              type="button"
              className="card-carousel-arrow card-carousel-arrow--left"
              onClick={(evento) => {
                evento.stopPropagation();
                navegar(-1);
              }}
              aria-label="Imagem anterior"
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              className="card-carousel-arrow card-carousel-arrow--right"
              onClick={(evento) => {
                evento.stopPropagation();
                navegar(1);
              }}
              aria-label="Próxima imagem"
            >
              <ChevronRight />
            </button>
            <div className="image-dots" aria-hidden="true">
              {produto.imagens.map((_, posicao) => (
                <span key={posicao} className={posicao === indice ? "active" : ""} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="card-body">
        <p className="card-category">{categoria}</p>
        <h3 className="card-name">{produto.nome}</h3>
        <p className="card-price">
          {produto.sobConsulta ? "A consultar" : formatarBRL(produto.preco)}
        </p>
        {produto.descricao && <p className="card-desc">{produto.descricao}</p>}
      </div>

      <div className="card-expand" aria-hidden={!expandido}>
        <p className="card-expand-note">Veja os detalhes ou peça diretamente pelo WhatsApp.</p>
        <div className="expand-buttons">
          <button
            className="btn-ver"
            type="button"
            onClick={(evento) => {
              evento.stopPropagation();
              onAbrir();
            }}
          >
            Ver Produto
          </button>
          {!produto.sobConsulta && (
            <button
              className="btn-comprar"
              type="button"
              onClick={(evento) => {
                evento.stopPropagation();
                onAbrir();
              }}
            >
              Comprar
            </button>
          )}
          <a
            className="btn-wa-card"
            href={linkWhatsAppProduto(whatsapp, produto)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(evento) => evento.stopPropagation()}
          >
            <WhatsAppIcon />
            Pedir
          </a>
        </div>
      </div>
    </article>
  );
}

function DetalheProduto({
  produto,
  categoria,
  whatsapp,
}: {
  produto: Produto;
  categoria: string;
  whatsapp: string;
}) {
  const [indice, setIndice] = useState(0);
  const [quantidade, setQuantidade] = useState(1);
  const [cep, setCep] = useState("");
  const [calculando, setCalculando] = useState(false);
  const [opcoes, setOpcoes] = useState<OpcaoFrete[] | null>(null);
  const [escolhida, setEscolhida] = useState<OpcaoFrete | null>(null);
  const [erroFrete, setErroFrete] = useState<string | null>(null);

  const total = (produto.preco ?? 0) * quantidade;
  const imagem = produto.imagens[indice];

  function alterarQuantidade(novaQuantidade: number) {
    setQuantidade(Math.max(1, Math.min(10, novaQuantidade)));
    setOpcoes(null);
    setEscolhida(null);
  }

  async function calcularFrete() {
    const limpo = cep.replace(/\D/g, "");
    if (limpo.length !== 8) {
      setErroFrete("Digite um CEP com 8 dígitos.");
      return;
    }

    setCalculando(true);
    setErroFrete(null);
    setOpcoes(null);
    setEscolhida(null);

    try {
      const resposta = await fetch("/api/calcular-frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produtoId: produto.id, quantidade, cepDestino: limpo }),
      });
      const dados = await resposta.json();

      if (!resposta.ok) {
        setErroFrete(dados.erro ?? "Não foi possível calcular o frete.");
        return;
      }
      if (!dados.opcoes?.length) {
        setErroFrete(dados.aviso ?? "Nenhuma opção de entrega para este CEP.");
        return;
      }
      setOpcoes(dados.opcoes);
      setEscolhida(dados.opcoes[0]);
    } catch {
      setErroFrete("Erro de conexão. Tente novamente.");
    } finally {
      setCalculando(false);
    }
  }

  function linkWhatsApp() {
    const linhas = [`Olá! Tenho interesse em: ${produto.nome}`];

    if (quantidade > 1) linhas.push(`Quantidade: ${quantidade}`);
    if (!produto.sobConsulta) linhas.push(`Valor: ${formatarBRL(total)}`);

    if (escolhida) {
      linhas.push(
        `Entrega: ${escolhida.transportadora} ${escolhida.servico} — ${formatarBRL(escolhida.preco)}` +
          (escolhida.prazoDias != null ? ` (${escolhida.prazoDias} dia(s))` : ""),
      );
      linhas.push(`CEP: ${mascararCEP(cep)}`);
      if (!produto.sobConsulta) {
        linhas.push(`Total com frete: ${formatarBRL(total + escolhida.preco)}`);
      }
    }

    return `https://wa.me/${whatsapp}?text=${encodeURIComponent(linhas.join("\n"))}`;
  }

  return (
    <div className="product-detail">
      <div className="modal-img-wrap">
        {imagem ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imagem.url} alt={imagem.alt} />
        ) : (
          <div className="img-placeholder">🌸</div>
        )}

        {produto.badge && (
          <span className={`modal-badge ${classeBadge(produto.badge)}`}>{produto.badge}</span>
        )}

        {produto.imagens.length > 1 && (
          <>
            <button
              type="button"
              className="modal-carousel-arrow modal-carousel-arrow--left"
              onClick={() =>
                setIndice((atual) =>
                  atual === 0 ? produto.imagens.length - 1 : atual - 1,
                )
              }
              aria-label="Imagem anterior"
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              className="modal-carousel-arrow modal-carousel-arrow--right"
              onClick={() => setIndice((atual) => (atual + 1) % produto.imagens.length)}
              aria-label="Próxima imagem"
            >
              <ChevronRight />
            </button>
            <div className="image-dots modal-image-dots" aria-hidden="true">
              {produto.imagens.map((_, posicao) => (
                <span key={posicao} className={posicao === indice ? "active" : ""} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="modal-info checkout-form">
        <div>
          <p className="modal-category">{categoria}</p>
          <h2 className="modal-name">{produto.nome}</h2>
          {produto.descricao && <p className="modal-desc">{produto.descricao}</p>}
          <p className="modal-price">
            {produto.sobConsulta ? "A consultar" : formatarBRL(produto.preco)}
          </p>
        </div>

        {!produto.sobConsulta && (
          <div className="quantity-row">
            <span>Quantidade</span>
            <div className="quantity-control">
              <button type="button" onClick={() => alterarQuantidade(quantidade - 1)}>
                −
              </button>
              <strong>{quantidade}</strong>
              <button type="button" onClick={() => alterarQuantidade(quantidade + 1)}>
                +
              </button>
            </div>
          </div>
        )}

        {produto.freteHabilitado && !produto.sobConsulta && (
          <section className="shipping-box">
            <h3 className="shipping-title">
              <Truck />
              Calcular entrega
            </h3>
            <div className="shipping-input-row">
              <input
                className="shipping-input"
                placeholder="00000-000"
                value={cep}
                onChange={(evento) => setCep(mascararCEP(evento.target.value))}
                onKeyDown={(evento) => {
                  if (evento.key === "Enter") calcularFrete();
                }}
                aria-label="CEP para entrega"
              />
              <button
                type="button"
                className={`btn-calcular-frete ${calculando ? "is-loading" : ""}`}
                onClick={calcularFrete}
                disabled={calculando}
              >
                {calculando ? "Calculando" : "Calcular"}
              </button>
            </div>

            {erroFrete && <p className="mensagem-erro">{erroFrete}</p>}

            {opcoes && (
              <div className="frete-opcoes">
                {opcoes.map((opcao) => {
                  const selecionada =
                    escolhida?.codigoServico === opcao.codigoServico &&
                    escolhida?.servico === opcao.servico;

                  return (
                    <button
                      type="button"
                      key={`${opcao.codigoServico}-${opcao.servico}`}
                      className={`frete-opcao ${selecionada ? "selecionada" : ""}`}
                      onClick={() => setEscolhida(opcao)}
                    >
                      <span className="frete-opcao-principal">
                        <span className="frete-opcao-nome">
                          {opcao.transportadora} {opcao.servico}
                        </span>
                        <strong className="frete-opcao-preco">{formatarBRL(opcao.preco)}</strong>
                      </span>
                      {opcao.prazoDias != null && (
                        <span className="frete-opcao-prazo">
                          até {opcao.prazoDias} dia(s) útil(eis)
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {escolhida && (
              <div className="resumo-pedido">
                <div className="resumo-linha">
                  <span className="resumo-rotulo">Produtos</span>
                  <span className="resumo-valor">{formatarBRL(total)}</span>
                </div>
                <div className="resumo-linha">
                  <span className="resumo-rotulo">Entrega</span>
                  <span className="resumo-valor">{formatarBRL(escolhida.preco)}</span>
                </div>
                <div className="resumo-linha resumo-total">
                  <span>Total</span>
                  <span>{formatarBRL(total + escolhida.preco)}</span>
                </div>
              </div>
            )}
          </section>
        )}

        {(produto.sobConsulta || !produto.freteHabilitado) && (
          <p className="product-notice">
            {produto.sobConsulta
              ? "Este produto é feito sob encomenda. Fale conosco para combinar valor e prazo."
              : "A entrega deste item é combinada diretamente pelo WhatsApp."}
          </p>
        )}

        <a className="btn-whatsapp-modal" href={linkWhatsApp()} target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon />
          Pedir pelo WhatsApp
        </a>
      </div>
    </div>
  );
}
