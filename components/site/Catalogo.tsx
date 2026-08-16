"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Car,
  CaretLeft,
  CaretRight,
  CreditCard,
  MapPin,
  MagnifyingGlass,
  Minus,
  Plus,
  QrCode,
  ShareNetwork,
  ShoppingBag,
  ShoppingCart,
  Trash,
  Truck,
  X,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  calcularParcela,
  calcularValorCredito,
  formatarBRL,
  formatarParcelamento,
  mascararCEP,
  mascararTelefone,
  PARCELAS_MAXIMAS,
} from "@/lib/utils";
import { useCarrinho } from "./CarrinhoContext";

/// Placeholder borrado enquanto a foto real carrega — mesmo degradê
/// rosa/lavanda usado no fundo dos cards, só que como blur em vez de
/// aparecer/sumir seco.
const PLACEHOLDER_BLUR =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F5DDEB"/><stop offset="1" stop-color="#D9B3D9"/></linearGradient></defs><rect width="12" height="12" fill="url(#g)"/></svg>`,
  );

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

type EnderecoViaCep = {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
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

/// Compartilha o link direto do produto (?produto=<id>, lido por
/// Catalogo pra reabrir o modal certo, e por generateMetadata pra
/// gerar a prévia com foto/preço quando colado no WhatsApp).
async function compartilharProduto(produto: Produto) {
  const url = `${window.location.origin}/?produto=${produto.id}`;
  const texto = produto.sobConsulta ? produto.nome : `${produto.nome} — ${formatarBRL(produto.preco)}`;

  if (navigator.share) {
    try {
      await navigator.share({ title: `${produto.nome} — Refúgio das Flores`, text: texto, url });
      return;
    } catch (erro) {
      // Cancelar o painel de compartilhamento do navegador não é erro
      // — qualquer outra falha cai pro link copiado, pra sempre dar
      // algum feedback em vez de não fazer nada silenciosamente.
      if ((erro as Error)?.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    toast.success("Link do produto copiado!");
  } catch {
    toast.error("Não foi possível copiar o link.");
  }
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function Catalogo({
  categorias,
  whatsapp,
  produtoInicialId,
}: {
  categorias: Categoria[];
  whatsapp: string;
  produtoInicialId?: string;
}) {
  const [filtro, setFiltro] = useState("todas");
  const [busca, setBusca] = useState("");
  const [expandido, setExpandido] = useState<string | null>(null);
  const [aberto, setAberto] = useState<ProdutoAberto | null>(null);
  const { adicionar, abrirCarrinho } = useCarrinho();

  // Link direto pra um produto (?produto=<id>, ex.: compartilhado pelo
  // WhatsApp): abre o modal desse item assim que a página carrega.
  useEffect(() => {
    if (!produtoInicialId) return;
    for (const categoria of categorias) {
      const produto = categoria.produtos.find((p) => p.id === produtoInicialId);
      if (produto) {
        setAberto({ produto, categoria: categoria.nome });
        return;
      }
    }
    // Não achou: o link é de um produto que já saiu do catálogo
    // (despublicado ou removido) — avisa em vez de não fazer nada.
    // Adiado: nesse primeiro efeito da página, o <Toaster> (renderizado
    // depois de {children} no layout) ainda pode não ter se inscrito
    // pra receber toasts — chamar direto perde o aviso.
    const id = setTimeout(() => toast.error("Esse produto não está mais disponível."), 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mantém a URL em sincronia com o modal aberto, pra dar pra
  // compartilhar/atualizar a página no produto certo — sem navegar de
  // verdade (evita refetch do server component a cada abrir/fechar).
  useEffect(() => {
    const url = new URL(window.location.href);
    if (aberto) {
      url.searchParams.set("produto", aberto.produto.id);
    } else {
      url.searchParams.delete("produto");
    }
    window.history.replaceState(null, "", url);
  }, [aberto]);

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
          <MagnifyingGlass className="search-icon" size={17} weight="bold" aria-hidden="true" />
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
                  expandido={expandido === produto.id}
                  onAlternar={() => setExpandido((id) => (id === produto.id ? null : produto.id))}
                  onAbrir={() => setAberto({ produto, categoria: categoria.nome })}
                  onComprar={() => {
                    adicionar(produto.id, 1);
                    abrirCarrinho();
                  }}
                  onAdicionarCarrinho={() => {
                    adicionar(produto.id, 1);
                    toast.success(`${produto.nome} adicionado ao carrinho!`, {
                      action: { label: "Ver carrinho", onClick: () => abrirCarrinho() },
                    });
                  }}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {categoriasVisiveis.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🌸</div>
          <p>Não encontramos esse arranjo</p>
          <span>Tente outra palavra ou escolha uma das categorias ali em cima</span>
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
            <button
              className="modal-share"
              onClick={() => compartilharProduto(aberto.produto)}
              aria-label="Compartilhar produto"
            >
              <ShareNetwork size={16} weight="bold" />
            </button>
            <button className="modal-close" onClick={() => setAberto(null)} aria-label="Fechar">
              <X size={16} weight="bold" />
            </button>
            <DetalheProduto
              key={aberto.produto.id}
              produto={aberto.produto}
              categoria={aberto.categoria}
              whatsapp={whatsapp}
              aoFechar={() => setAberto(null)}
            />
          </div>
        </div>
      )}

      <CarrinhoDrawer categorias={categorias} whatsapp={whatsapp} />
    </main>
  );
}

function FiltroBotao({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button className={`pill ${ativo ? "active" : ""}`} onClick={onClick} type="button">
      {children}
    </button>
  );
}

function CardProduto({
  produto,
  categoria,
  expandido,
  onAlternar,
  onAbrir,
  onComprar,
  onAdicionarCarrinho,
}: {
  produto: Produto;
  categoria: string;
  expandido: boolean;
  onAlternar: () => void;
  onAbrir: () => void;
  onComprar: () => void;
  onAdicionarCarrinho: () => void;
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
          <Image
            src={imagem.url}
            alt={imagem.alt}
            fill
            sizes="(min-width: 1180px) 23vw, (min-width: 640px) 30vw, 45vw"
            placeholder="blur"
            blurDataURL={PLACEHOLDER_BLUR}
          />
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
              <CaretLeft size={18} weight="bold" />
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
              <CaretRight size={18} weight="bold" />
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
        <div className="card-price">
          {produto.sobConsulta || produto.preco === null ? (
            "A consultar"
          ) : (
            <>
              <span className="card-price-pix">{formatarBRL(produto.preco)} no Pix</span>
              <span className="card-price-parcelas">{formatarParcelamento(produto.preco)}</span>
            </>
          )}
        </div>
        {produto.descricao && <p className="card-desc">{produto.descricao}</p>}
      </div>

      <div className="card-expand" aria-hidden={!expandido}>
        <p className="card-expand-note">Veja os detalhes ou compre agora mesmo.</p>
        <div className="expand-buttons">
          {!produto.sobConsulta && (
            <>
              <button
                className="btn-comprar"
                type="button"
                onClick={(evento) => {
                  evento.stopPropagation();
                  onComprar();
                }}
              >
                <ShoppingBag className="btn-comprar-icon" weight="bold" aria-hidden="true" />
                Comprar
              </button>
              <button
                className="btn-add-carrinho"
                type="button"
                onClick={(evento) => {
                  evento.stopPropagation();
                  onAdicionarCarrinho();
                }}
              >
                <ShoppingCart weight="bold" aria-hidden="true" />
                Adicionar ao carrinho
              </button>
            </>
          )}
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
        </div>
      </div>
    </article>
  );
}

function DetalheProduto({
  produto,
  categoria,
  whatsapp,
  aoFechar,
}: {
  produto: Produto;
  categoria: string;
  whatsapp: string;
  aoFechar: () => void;
}) {
  const [indice, setIndice] = useState(0);
  const [quantidade, setQuantidade] = useState(1);
  const [cep, setCep] = useState("");
  const [calculando, setCalculando] = useState(false);
  const [opcoes, setOpcoes] = useState<OpcaoFrete[] | null>(null);
  const [escolhida, setEscolhida] = useState<OpcaoFrete | null>(null);
  const [erroFrete, setErroFrete] = useState<string | null>(null);
  const [freteLocal, setFreteLocal] = useState(false);
  const { adicionar, abrirCarrinho } = useCarrinho();

  const total = (produto.preco ?? 0) * quantidade;
  const imagem = produto.imagens[indice];

  function alterarQuantidade(novaQuantidade: number) {
    setQuantidade(Math.max(1, Math.min(10, novaQuantidade)));
    setOpcoes(null);
    setEscolhida(null);
  }

  function adicionarAoCarrinho() {
    adicionar(produto.id, quantidade);
    toast.success(`${produto.nome} adicionado ao carrinho!`, {
      action: { label: "Ver carrinho", onClick: () => abrirCarrinho() },
    });
    aoFechar();
  }

  function comprarAgora() {
    adicionar(produto.id, quantidade);
    aoFechar();
    abrirCarrinho();
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
    setFreteLocal(false);

    try {
      // Dourados/MS é entrega própria (carro/moto), não Correios ou
      // transportadora — nem vale a pena cotar. Consulta o ViaCEP só
      // pra saber a cidade e decidir se cai no caso local.
      let cidadeDetectada = "";
      let estadoDetectado = "";
      try {
        const respostaCep = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
        const dadosCep: EnderecoViaCep = await respostaCep.json();
        if (!dadosCep.erro) {
          cidadeDetectada = dadosCep.localidade ?? "";
          estadoDetectado = (dadosCep.uf ?? "").toUpperCase();
        }
      } catch {
        // Sem resposta do ViaCEP: segue para a cotação normal.
      }

      if (normalizar(cidadeDetectada) === "dourados" && estadoDetectado === "MS") {
        setFreteLocal(true);
        return;
      }

      const resposta = await fetch("/api/calcular-frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itens: [{ produtoId: produto.id, quantidade }], cepDestino: limpo }),
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
          <Image
            src={imagem.url}
            alt={imagem.alt}
            fill
            sizes="(min-width: 1180px) 560px, 92vw"
            placeholder="blur"
            blurDataURL={PLACEHOLDER_BLUR}
          />
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
              <CaretLeft size={18} weight="bold" />
            </button>
            <button
              type="button"
              className="modal-carousel-arrow modal-carousel-arrow--right"
              onClick={() => setIndice((atual) => (atual + 1) % produto.imagens.length)}
              aria-label="Próxima imagem"
            >
              <CaretRight size={18} weight="bold" />
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
          <div className="modal-price">
            {produto.sobConsulta || produto.preco === null ? (
              "A consultar"
            ) : (
              <>
                <span className="modal-price-pix">{formatarBRL(produto.preco)} no Pix</span>
                <span className="modal-price-parcelas">{formatarParcelamento(produto.preco)}</span>
              </>
            )}
          </div>
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
              <Truck weight="bold" />
              Calcular entrega
            </h3>

            <div className="shipping-input-row">
              <input
                className="shipping-input"
                placeholder="00000-000"
                value={cep}
                onChange={(evento) => {
                  setCep(mascararCEP(evento.target.value));
                  setOpcoes(null);
                  setEscolhida(null);
                  setFreteLocal(false);
                }}
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

            {freteLocal && (
              <div className="frete-local-aviso">
                <Car weight="bold" aria-hidden="true" />
                <div>
                  <strong>Você está em Dourados/MS!</strong>
                  <p>
                    Aqui a entrega é feita por nós mesmos, de carro ou moto — sem Correios ou
                    transportadora. O valor da entrega local é combinado direto pelo WhatsApp.
                  </p>
                </div>
              </div>
            )}

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

        {produto.sobConsulta ? (
          <a
            className="btn-whatsapp-modal"
            href={linkWhatsApp()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => toast.success("Abrindo o WhatsApp em outra aba…")}
          >
            <WhatsAppIcon />
            Pedir pelo WhatsApp
          </a>
        ) : (
          <>
            <button type="button" className="btn-comprar-modal" onClick={comprarAgora}>
              <ShoppingBag weight="bold" aria-hidden="true" />
              Comprar
            </button>
            <button type="button" className="btn-add-carrinho-modal" onClick={adicionarAoCarrinho}>
              <ShoppingCart weight="bold" aria-hidden="true" />
              Adicionar ao carrinho
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/// Checkout do carrinho inteiro — mesma lógica de endereço/CEP/frete/
/// WhatsApp que antes vivia em DetalheProduto, só que somando todos
/// os itens de uma vez (a Frenet cota a caixa consolidada).
function CarrinhoDrawer({ categorias, whatsapp }: { categorias: Categoria[]; whatsapp: string }) {
  const { itens, aberto, fecharCarrinho, definirQuantidade, remover, limpar } = useCarrinho();

  const mapaProdutos = useMemo(() => {
    const mapa = new Map<string, { produto: Produto; categoria: string }>();
    for (const categoria of categorias) {
      for (const produto of categoria.produtos) {
        mapa.set(produto.id, { produto, categoria: categoria.nome });
      }
    }
    return mapa;
  }, [categorias]);

  // Ignora silenciosamente itens de produtos que saíram do catálogo
  // desde que foram adicionados (despublicados/removidos).
  const itensResolvidos = useMemo(
    () =>
      itens
        .map((item) => {
          const encontrado = mapaProdutos.get(item.produtoId);
          return encontrado ? { ...item, produto: encontrado.produto } : null;
        })
        .filter((item): item is { produtoId: string; quantidade: number; produto: Produto } => item !== null),
    [itens, mapaProdutos],
  );

  const subtotal = itensResolvidos.reduce(
    (soma, item) => soma + (item.produto.preco ?? 0) * item.quantidade,
    0,
  );

  const [cep, setCep] = useState("");
  const [calculando, setCalculando] = useState(false);
  const [opcoes, setOpcoes] = useState<OpcaoFrete[] | null>(null);
  const [escolhida, setEscolhida] = useState<OpcaoFrete | null>(null);
  const [erroFrete, setErroFrete] = useState<string | null>(null);
  const [freteLocal, setFreteLocal] = useState(false);

  const [formaPagamento, setFormaPagamento] = useState<"pix" | "credito">("pix");
  const [parcelas, setParcelas] = useState(1);

  const [nomeCliente, setNomeCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [statusCep, setStatusCep] = useState<"idle" | "buscando" | "sucesso" | "erro">("idle");
  const [tentouEnviar, setTentouEnviar] = useState(false);

  async function buscarEndereco(cepDigitado: string) {
    const limpo = cepDigitado.replace(/\D/g, "");
    if (limpo.length !== 8) return;

    setStatusCep("buscando");
    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
      const dados: EnderecoViaCep = await resposta.json();

      if (!resposta.ok || dados.erro) {
        setStatusCep("erro");
        return;
      }

      setRua(dados.logradouro ?? "");
      setBairro(dados.bairro ?? "");
      setCidade(dados.localidade ?? "");
      setEstado((dados.uf ?? "").toUpperCase());
      setStatusCep("sucesso");
    } catch {
      setStatusCep("erro");
    }
  }

  function alterarCep(valor: string) {
    const mascarado = mascararCEP(valor);
    setCep(mascarado);
    setOpcoes(null);
    setEscolhida(null);
    setFreteLocal(false);
    if (mascarado.replace(/\D/g, "").length === 8) {
      void buscarEndereco(mascarado);
    } else {
      setStatusCep("idle");
    }
  }

  const enderecoValido =
    cep.replace(/\D/g, "").length === 8 &&
    rua.trim().length > 0 &&
    numero.trim().length > 0 &&
    bairro.trim().length > 0 &&
    cidade.trim().length > 0 &&
    estado.trim().length === 2;

  const dadosClienteValidos = nomeCliente.trim().length > 1 && telefone.replace(/\D/g, "").length >= 10;
  const formularioValido = dadosClienteValidos && enderecoValido && itensResolvidos.length > 0;

  // Base sobre a qual a taxa do cartão incide: produtos + frete (quando
  // já escolhido) — é o valor que realmente vai passar na maquininha.
  const freteValor = escolhida?.preco ?? 0;
  const totalBase = subtotal + freteValor;
  const totalFinal =
    formaPagamento === "credito" ? calcularValorCredito(totalBase, parcelas) : totalBase;

  async function calcularFrete() {
    const limpo = cep.replace(/\D/g, "");
    if (limpo.length !== 8) {
      setErroFrete("Digite um CEP com 8 dígitos.");
      return;
    }
    if (itensResolvidos.length === 0) return;

    setCalculando(true);
    setErroFrete(null);
    setOpcoes(null);
    setEscolhida(null);
    setFreteLocal(false);

    try {
      // Endereço já foi buscado (autofill do CEP) — usa direto, sem
      // nova chamada ao ViaCEP.
      if (normalizar(cidade) === "dourados" && estado === "MS") {
        setFreteLocal(true);
        return;
      }

      const resposta = await fetch("/api/calcular-frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itens: itensResolvidos.map((item) => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade,
          })),
          cepDestino: limpo,
        }),
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

  function linkPedido() {
    const linhas = ["Olá! Gostaria de fazer um pedido:", "", "*Itens:*"];

    for (const item of itensResolvidos) {
      const precoItem = (item.produto.preco ?? 0) * item.quantidade;
      linhas.push(
        `• ${item.produto.nome}${item.quantidade > 1 ? ` (x${item.quantidade})` : ""} — ${formatarBRL(precoItem)}`,
      );
    }

    linhas.push("", `*Subtotal:* ${formatarBRL(subtotal)}`);

    if (escolhida) {
      linhas.push(
        `*Entrega:* ${escolhida.transportadora} ${escolhida.servico} — ${formatarBRL(escolhida.preco)}` +
          (escolhida.prazoDias != null ? ` (${escolhida.prazoDias} dia(s))` : ""),
      );
    } else if (freteLocal) {
      linhas.push("*Entrega:* local (Dourados/MS) — combinar valor por aqui");
    }

    if (formaPagamento === "credito") {
      linhas.push(
        `*Pagamento:* Cartão de crédito em ${parcelas}x de ${formatarBRL(calcularParcela(totalBase, parcelas))}`,
        `*Total no cartão:* ${formatarBRL(totalFinal)}`,
      );
    } else {
      linhas.push("*Pagamento:* Pix", `*Total:* ${formatarBRL(totalFinal)}`);
    }

    linhas.push(
      "",
      "*Endereço de entrega:*",
      `${rua}, ${numero}${complemento ? ` - ${complemento}` : ""}`,
      `${bairro} — ${cidade}/${estado}`,
      `CEP: ${mascararCEP(cep)}`,
      "",
      "*Dados do cliente:*",
      `Nome: ${nomeCliente}`,
      `Telefone: ${telefone}`,
    );

    if (observacoes.trim()) {
      linhas.push("", `*Observações:* ${observacoes.trim()}`);
    }

    return `https://wa.me/${whatsapp}?text=${encodeURIComponent(linhas.join("\n"))}`;
  }

  function finalizarPedido() {
    if (!formularioValido) {
      setTentouEnviar(true);
      return;
    }
    window.open(linkPedido(), "_blank", "noopener,noreferrer");
    toast.success("Pedido pronto! Confira a aba do WhatsApp que abriu.");
    limpar();
    fecharCarrinho();
  }

  useEffect(() => {
    if (!aberto) return;

    function fecharComEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") fecharCarrinho();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", fecharComEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", fecharComEscape);
    };
  }, [aberto, fecharCarrinho]);

  if (!aberto) return null;

  return (
    <div className="modal-overlay open" role="presentation" onMouseDown={() => fecharCarrinho()}>
      <div
        className="modal-card checkout-card"
        role="dialog"
        aria-modal="true"
        aria-label="Seu carrinho"
        onMouseDown={(evento) => evento.stopPropagation()}
      >
        <button className="modal-close" onClick={() => fecharCarrinho()} aria-label="Fechar">
          <X size={16} weight="bold" />
        </button>

        <div className="checkout-form cart-drawer-content">
          <h2 className="cart-drawer-title">
            <ShoppingCart weight="bold" aria-hidden="true" />
            Seu carrinho
          </h2>

          {itensResolvidos.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🌸</div>
              <p>Seu carrinho está vazio</p>
              <span>Adicione produtos pelo catálogo pra montar seu pedido.</span>
            </div>
          ) : (
            <>
              <div className="cart-item-list">
                {itensResolvidos.map((item) => {
                  const imagem = item.produto.imagens[0];
                  return (
                    <div className="cart-item" key={item.produtoId}>
                      <div className="cart-item-img">
                        {imagem ? (
                          <Image src={imagem.url} alt={imagem.alt} fill sizes="64px" />
                        ) : (
                          <div className="img-placeholder">🌸</div>
                        )}
                      </div>
                      <div className="cart-item-info">
                        <p className="cart-item-name">{item.produto.nome}</p>
                        <p className="cart-item-price">{formatarBRL(item.produto.preco)}</p>
                        <div className="cart-item-row">
                          <div className="quantity-control">
                            <button
                              type="button"
                              onClick={() => definirQuantidade(item.produtoId, item.quantidade - 1)}
                              aria-label="Diminuir quantidade"
                            >
                              <Minus size={12} weight="bold" />
                            </button>
                            <strong>{item.quantidade}</strong>
                            <button
                              type="button"
                              onClick={() => definirQuantidade(item.produtoId, item.quantidade + 1)}
                              aria-label="Aumentar quantidade"
                            >
                              <Plus size={12} weight="bold" />
                            </button>
                          </div>
                          <button
                            type="button"
                            className="cart-item-remove"
                            onClick={() => remover(item.produtoId)}
                            aria-label={`Remover ${item.produto.nome} do carrinho`}
                          >
                            <Trash size={16} weight="bold" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="cart-subtotal">
                <span>Subtotal</span>
                <span>{formatarBRL(subtotal)}</span>
              </div>

              <fieldset className="form-fieldset">
                <legend>Seus dados</legend>
                <div className="form-group">
                  <label htmlFor="carrinhoNome">Nome completo</label>
                  <input
                    id="carrinhoNome"
                    placeholder="Seu nome"
                    value={nomeCliente}
                    onChange={(evento) => setNomeCliente(evento.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="carrinhoTelefone">Telefone (WhatsApp)</label>
                  <input
                    id="carrinhoTelefone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={telefone}
                    onChange={(evento) => setTelefone(mascararTelefone(evento.target.value))}
                  />
                </div>
              </fieldset>

              <fieldset className="form-fieldset">
                <legend>Endereço de entrega</legend>
                <div className="form-row">
                  <div className="form-group form-group--small">
                    <label htmlFor="carrinhoCep">CEP</label>
                    <input
                      id="carrinhoCep"
                      placeholder="00000-000"
                      value={cep}
                      onChange={(evento) => alterarCep(evento.target.value)}
                      aria-label="CEP para entrega"
                    />
                  </div>
                  <div className="form-group form-group--small">
                    <label htmlFor="carrinhoNumero">Número</label>
                    <input
                      id="carrinhoNumero"
                      placeholder="Nº"
                      value={numero}
                      onChange={(evento) => setNumero(evento.target.value)}
                    />
                  </div>
                </div>

                {statusCep !== "idle" && (
                  <p
                    className={`campo-status ${
                      statusCep === "buscando"
                        ? "campo-status--loading"
                        : statusCep === "sucesso"
                          ? "campo-status--sucesso"
                          : "campo-status--erro"
                    }`}
                  >
                    {statusCep === "buscando" && (
                      <>
                        <span className="campo-status-spinner" aria-hidden="true" />
                        Buscando endereço…
                      </>
                    )}
                    {statusCep === "sucesso" && "Endereço encontrado — confira os dados abaixo."}
                    {statusCep === "erro" && "CEP não encontrado. Preencha o endereço manualmente."}
                  </p>
                )}

                <div className="form-group">
                  <label htmlFor="carrinhoRua">Rua</label>
                  <input
                    id="carrinhoRua"
                    placeholder="Nome da rua"
                    value={rua}
                    onChange={(evento) => setRua(evento.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group form-group--grow">
                    <label htmlFor="carrinhoBairro">Bairro</label>
                    <input
                      id="carrinhoBairro"
                      placeholder="Bairro"
                      value={bairro}
                      onChange={(evento) => setBairro(evento.target.value)}
                    />
                  </div>
                  <div className="form-group form-group--grow">
                    <label htmlFor="carrinhoCidade">Cidade</label>
                    <input
                      id="carrinhoCidade"
                      placeholder="Cidade"
                      value={cidade}
                      onChange={(evento) => setCidade(evento.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group form-group--small">
                    <label htmlFor="carrinhoEstado">UF</label>
                    <input
                      id="carrinhoEstado"
                      placeholder="UF"
                      maxLength={2}
                      value={estado}
                      onChange={(evento) => setEstado(evento.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="form-group form-group--grow">
                    <label htmlFor="carrinhoComplemento">
                      Complemento <span className="campo-opcional">(opcional)</span>
                    </label>
                    <input
                      id="carrinhoComplemento"
                      placeholder="Apto, bloco, referência…"
                      value={complemento}
                      onChange={(evento) => setComplemento(evento.target.value)}
                    />
                  </div>
                </div>
              </fieldset>

              <section className="shipping-box">
                <h3 className="shipping-title">
                  <Truck weight="bold" />
                  Calcular entrega
                </h3>
                <div className="shipping-input-row">
                  <p className="shipping-cep-atual">
                    {cep
                      ? `Frete para o CEP ${mascararCEP(cep)}`
                      : "Informe o CEP acima para calcular o frete"}
                  </p>
                  <button
                    type="button"
                    className={`btn-calcular-frete ${calculando ? "is-loading" : ""}`}
                    onClick={calcularFrete}
                    disabled={calculando || cep.replace(/\D/g, "").length !== 8}
                  >
                    {calculando ? "Calculando" : "Calcular"}
                  </button>
                </div>

                {erroFrete && <p className="mensagem-erro">{erroFrete}</p>}

                {freteLocal && (
                  <div className="frete-local-aviso">
                    <Car weight="bold" aria-hidden="true" />
                    <div>
                      <strong>Você está em Dourados/MS!</strong>
                      <p>
                        Aqui a entrega é feita por nós mesmos, de carro ou moto — sem Correios ou
                        transportadora. O valor da entrega local é combinado direto pelo WhatsApp.
                      </p>
                    </div>
                  </div>
                )}

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
                      <span className="resumo-valor">{formatarBRL(subtotal)}</span>
                    </div>
                    <div className="resumo-linha">
                      <span className="resumo-rotulo">Entrega</span>
                      <span className="resumo-valor">{formatarBRL(escolhida.preco)}</span>
                    </div>
                    {formaPagamento === "credito" && (
                      <div className="resumo-linha">
                        <span className="resumo-rotulo">Pagamento</span>
                        <span className="resumo-valor">
                          {parcelas}x de {formatarBRL(calcularParcela(totalBase, parcelas))}
                        </span>
                      </div>
                    )}
                    <div className="resumo-linha resumo-total">
                      <span>Total {formaPagamento === "credito" ? "no cartão" : "no Pix"}</span>
                      <span>{formatarBRL(totalFinal)}</span>
                    </div>
                  </div>
                )}
              </section>

              <fieldset className="form-fieldset">
                <legend>Forma de pagamento</legend>
                <div className="payment-method-pills" role="group" aria-label="Forma de pagamento">
                  <button
                    type="button"
                    className={`payment-pill ${formaPagamento === "pix" ? "active" : ""}`}
                    onClick={() => setFormaPagamento("pix")}
                  >
                    <QrCode weight="bold" aria-hidden="true" />
                    Pix
                  </button>
                  <button
                    type="button"
                    className={`payment-pill ${formaPagamento === "credito" ? "active" : ""}`}
                    onClick={() => setFormaPagamento("credito")}
                  >
                    <CreditCard weight="bold" aria-hidden="true" />
                    Cartão de crédito
                  </button>
                </div>

                {formaPagamento === "pix" && (
                  <p className="payment-pix-total">
                    Total no Pix: <strong>{formatarBRL(totalBase)}</strong>
                  </p>
                )}

                {formaPagamento === "credito" && (
                  <div className="installment-options" role="group" aria-label="Número de parcelas">
                    {Array.from({ length: PARCELAS_MAXIMAS }, (_, indice) => indice + 1).map((n) => (
                      <button
                        type="button"
                        key={n}
                        className={`installment-pill ${parcelas === n ? "active" : ""}`}
                        onClick={() => setParcelas(n)}
                      >
                        <span className="installment-pill-parcelas">
                          {n}x de {formatarBRL(calcularParcela(totalBase, n))}
                        </span>
                        {n > 1 && (
                          <span className="installment-pill-total">
                            Total {formatarBRL(calcularValorCredito(totalBase, n))}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </fieldset>

              <fieldset className="form-fieldset">
                <legend>
                  Observações <span className="campo-opcional">(opcional)</span>
                </legend>
                <div className="form-group">
                  <textarea
                    rows={3}
                    placeholder="Alguma preferência, mensagem para o cartão, horário de entrega…"
                    value={observacoes}
                    onChange={(evento) => setObservacoes(evento.target.value)}
                  />
                </div>
              </fieldset>

              {tentouEnviar && !formularioValido && (
                <p className="mensagem-erro">
                  <MapPin weight="bold" aria-hidden="true" />
                  Preencha nome, telefone e endereço completo (CEP, rua, número, bairro, cidade e UF)
                  para continuar.
                </p>
              )}

              <button
                type="button"
                className="btn-whatsapp-modal btn-enviar-pedido"
                onClick={finalizarPedido}
              >
                <WhatsAppIcon />
                Comprar pelo WhatsApp
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
