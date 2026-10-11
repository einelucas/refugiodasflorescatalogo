"use client";

import { formatarBRL } from "@/lib/utils";
import type { OpcaoFrete } from "@/types";

type FreightOptionCardProps = {
  option: OpcaoFrete;
  selected: boolean;
  onSelect: () => void;
};

export function FreightOptionCard({ option, selected, onSelect }: FreightOptionCardProps) {
  return (
    <button
      type="button"
      className={`frete-opcao ${selected ? "selecionada" : ""}`}
      onClick={onSelect}
    >
      <span className="frete-opcao-principal">
        <span className="frete-opcao-nome">
          {option.transportadora} {option.servico}
        </span>
        <strong className="frete-opcao-preco">{formatarBRL(option.preco)}</strong>
      </span>
      {option.prazoDias != null && (
        <span className="frete-opcao-prazo">até {option.prazoDias} dia(s) útil(eis)</span>
      )}
    </button>
  );
}
