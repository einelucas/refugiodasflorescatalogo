"use client";

import type { CampoEndereco, EnderecoEntrega, StatusCep } from "@/types";

type CheckoutAddressFormProps = {
  endereco: EnderecoEntrega;
  statusCep: StatusCep;
  onCepChange: (cep: string) => void;
  onCampoChange: (campo: CampoEndereco, valor: string) => void;
};

const CLASSE_STATUS: Record<Exclude<StatusCep, "idle">, string> = {
  buscando: "campo-status--loading",
  sucesso: "campo-status--sucesso",
  erro: "campo-status--erro",
};

export function CheckoutAddressForm({
  endereco,
  statusCep,
  onCepChange,
  onCampoChange,
}: CheckoutAddressFormProps) {
  return (
    <fieldset className="form-fieldset">
      <legend>Endereço de entrega</legend>
      <div className="form-row">
        <div className="form-group form-group--small">
          <label htmlFor="carrinhoCep">CEP</label>
          <input
            id="carrinhoCep"
            placeholder="00000-000"
            value={endereco.cep}
            onChange={(evento) => onCepChange(evento.target.value)}
            aria-label="CEP para entrega"
          />
        </div>
        <div className="form-group form-group--small">
          <label htmlFor="carrinhoNumero">Número</label>
          <input
            id="carrinhoNumero"
            placeholder="Nº"
            value={endereco.numero}
            onChange={(evento) => onCampoChange("numero", evento.target.value)}
          />
        </div>
      </div>

      {statusCep !== "idle" && (
        <p className={`campo-status ${CLASSE_STATUS[statusCep]}`}>
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
          value={endereco.rua}
          onChange={(evento) => onCampoChange("rua", evento.target.value)}
        />
      </div>

      <div className="form-row">
        <div className="form-group form-group--grow">
          <label htmlFor="carrinhoBairro">Bairro</label>
          <input
            id="carrinhoBairro"
            placeholder="Bairro"
            value={endereco.bairro}
            onChange={(evento) => onCampoChange("bairro", evento.target.value)}
          />
        </div>
        <div className="form-group form-group--grow">
          <label htmlFor="carrinhoCidade">Cidade</label>
          <input
            id="carrinhoCidade"
            placeholder="Cidade"
            value={endereco.cidade}
            onChange={(evento) => onCampoChange("cidade", evento.target.value)}
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
            value={endereco.estado}
            onChange={(evento) => onCampoChange("estado", evento.target.value)}
          />
        </div>
        <div className="form-group form-group--grow">
          <label htmlFor="carrinhoComplemento">
            Complemento <span className="campo-opcional">(opcional)</span>
          </label>
          <input
            id="carrinhoComplemento"
            placeholder="Apto, bloco, referência…"
            value={endereco.complemento}
            onChange={(evento) => onCampoChange("complemento", evento.target.value)}
          />
        </div>
      </div>
    </fieldset>
  );
}
