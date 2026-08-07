"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Car,
  CaretLeft,
  CaretRight,
  MapPin,
  MagnifyingGlass,
  ShoppingBag,
  Truck,
  X,
} from "@phosphor-icons/react";
import { formatarBRL, mascararCEP, mascararTelefone } from "@/lib/utils";

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

type ModoModal = "ver" | "comprar";
type ProdutoAberto = { produto: Produto; categoria: string; modo: ModoModal };

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
                  onAbrir={() => setAberto({ produto, categoria: categoria.nome, modo: "ver" })}
                  onComprar={() => setAberto({ produto, categoria: categoria.nome, modo: "comprar" })}
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
            <button className="modal-close" onClick={() => setAberto(null)} aria-label="Fechar">
              <X size={16} weight="bold" />
            </button>
            <DetalheProduto
              key={aberto.produto.id}
              produto={aberto.produto}
              categoria={aberto.categoria}
              whatsapp={whatsapp}
              modoInicial={aberto.modo}
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
}: {
  produto: Produto;
  categoria: string;
  expandido: boolean;
  onAlternar: () => void;
  onAbrir: () => void;
  onComprar: () => void;
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
        <p className="card-price">
          {produto.sobConsulta ? "A consultar" : formatarBRL(produto.preco)}
        </p>
        {produto.descricao && <p className="card-desc">{produto.descricao}</p>}
      </div>

      <div className="card-expand" aria-hidden={!expandido}>
        <p className="card-expand-note">Veja os detalhes ou compre agora mesmo.</p>
        <div className="expand-buttons">
          {!produto.sobConsulta && (
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
  modoInicial,
}: {
  produto: Produto;
  categoria: string;
  whatsapp: string;
  modoInicial: ModoModal;
}) {
  const [modo, setModo] = useState<ModoModal>(modoInicial);
  const [indice, setIndice] = useState(0);
  const [quantidade, setQuantidade] = useState(1);
  const [cep, setCep] = useState("");
  const [calculando, setCalculando] = useState(false);
  const [opcoes, setOpcoes] = useState<OpcaoFrete[] | null>(null);
  const [escolhida, setEscolhida] = useState<OpcaoFrete | null>(null);
  const [erroFrete, setErroFrete] = useState<string | null>(null);
  const [freteLocal, setFreteLocal] = useState(false);

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

  const total = (produto.preco ?? 0) * quantidade;
  const imagem = produto.imagens[indice];

  function alterarQuantidade(novaQuantidade: number) {
    setQuantidade(Math.max(1, Math.min(10, novaQuantidade)));
    setOpcoes(null);
    setEscolhida(null);
  }

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

  // Se o CEP já foi digitado no modo "ver" (para estimar o frete)
  // e a pessoa decide comprar, aproveita o valor e busca o endereço.
  useEffect(() => {
    if (modo === "comprar" && cep.replace(/\D/g, "").length === 8 && !rua) {
      void buscarEndereco(cep);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo]);

  const enderecoValido =
    cep.replace(/\D/g, "").length === 8 &&
    rua.trim().length > 0 &&
    numero.trim().length > 0 &&
    bairro.trim().length > 0 &&
    cidade.trim().length > 0 &&
    estado.trim().length === 2;

  const dadosClienteValidos = nomeCliente.trim().length > 1 && telefone.replace(/\D/g, "").length >= 10;

  const formularioValido = dadosClienteValidos && enderecoValido;

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
      // transportadora — nem vale a pena cotar. Usa cidade/UF já
      // buscados (modo comprar) ou consulta o ViaCEP na hora (modo ver).
      let cidadeDetectada = cidade;
      let estadoDetectado = estado;
      if (!cidadeDetectada || !estadoDetectado) {
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
      }

      if (normalizar(cidadeDetectada) === "dourados" && estadoDetectado === "MS") {
        setFreteLocal(true);
        return;
      }

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

  function linkPedidoCompleto() {
    const linhas = [
      "Olá! Gostaria de fazer um pedido:",
      "",
      `*Produto:* ${produto.nome}`,
    ];

    if (quantidade > 1) linhas.push(`*Quantidade:* ${quantidade}`);
    if (!produto.sobConsulta) linhas.push(`*Valor:* ${formatarBRL(total)}`);

    if (escolhida) {
      linhas.push(
        `*Entrega:* ${escolhida.transportadora} ${escolhida.servico} — ${formatarBRL(escolhida.preco)}` +
          (escolhida.prazoDias != null ? ` (${escolhida.prazoDias} dia(s))` : ""),
      );
      if (!produto.sobConsulta) {
        linhas.push(`*Total com frete:* ${formatarBRL(total + escolhida.preco)}`);
      }
    } else if (freteLocal) {
      linhas.push("*Entrega:* local (Dourados/MS) — combinar valor por aqui");
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
    window.open(linkPedidoCompleto(), "_blank", "noopener,noreferrer");
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

        {modo === "comprar" && !produto.sobConsulta && (
          <>
            <fieldset className="form-fieldset">
              <legend>Seus dados</legend>
              <div className="form-group">
                <label htmlFor="nomeCliente">Nome completo</label>
                <input
                  id="nomeCliente"
                  placeholder="Seu nome"
                  value={nomeCliente}
                  onChange={(evento) => setNomeCliente(evento.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="telefoneCliente">Telefone (WhatsApp)</label>
                <input
                  id="telefoneCliente"
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
                  <label htmlFor="cepEntrega">CEP</label>
                  <input
                    id="cepEntrega"
                    placeholder="00000-000"
                    value={cep}
                    onChange={(evento) => alterarCep(evento.target.value)}
                    aria-label="CEP para entrega"
                  />
                </div>
                <div className="form-group form-group--small">
                  <label htmlFor="numeroEntrega">Número</label>
                  <input
                    id="numeroEntrega"
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
                <label htmlFor="ruaEntrega">Rua</label>
                <input
                  id="ruaEntrega"
                  placeholder="Nome da rua"
                  value={rua}
                  onChange={(evento) => setRua(evento.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group form-group--grow">
                  <label htmlFor="bairroEntrega">Bairro</label>
                  <input
                    id="bairroEntrega"
                    placeholder="Bairro"
                    value={bairro}
                    onChange={(evento) => setBairro(evento.target.value)}
                  />
                </div>
                <div className="form-group form-group--grow">
                  <label htmlFor="cidadeEntrega">Cidade</label>
                  <input
                    id="cidadeEntrega"
                    placeholder="Cidade"
                    value={cidade}
                    onChange={(evento) => setCidade(evento.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group form-group--small">
                  <label htmlFor="estadoEntrega">UF</label>
                  <input
                    id="estadoEntrega"
                    placeholder="UF"
                    maxLength={2}
                    value={estado}
                    onChange={(evento) => setEstado(evento.target.value.toUpperCase())}
                  />
                </div>
                <div className="form-group form-group--grow">
                  <label htmlFor="complementoEntrega">
                    Complemento <span className="campo-opcional">(opcional)</span>
                  </label>
                  <input
                    id="complementoEntrega"
                    placeholder="Apto, bloco, referência…"
                    value={complemento}
                    onChange={(evento) => setComplemento(evento.target.value)}
                  />
                </div>
              </div>
            </fieldset>
          </>
        )}

        {produto.freteHabilitado && !produto.sobConsulta && (
          <section className="shipping-box">
            <h3 className="shipping-title">
              <Truck weight="bold" />
              Calcular entrega
            </h3>

            {modo === "ver" ? (
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
            ) : (
              <div className="shipping-input-row">
                <p className="shipping-cep-atual">
                  {cep ? `Frete para o CEP ${mascararCEP(cep)}` : "Informe o CEP acima para calcular o frete"}
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
            )}

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

        {modo === "comprar" && !produto.sobConsulta && (
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
        )}

        {modo === "ver" ? (
          produto.sobConsulta ? (
            <a className="btn-whatsapp-modal" href={linkWhatsApp()} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon />
              Pedir pelo WhatsApp
            </a>
          ) : (
            <button type="button" className="btn-comprar-modal" onClick={() => setModo("comprar")}>
              <ShoppingBag weight="bold" aria-hidden="true" />
              Comprar
            </button>
          )
        ) : (
          <>
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
  );
}
