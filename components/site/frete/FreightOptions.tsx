"use client";

import type { OpcaoFrete } from "@/types";
import { FreightOptionCard } from "./FreightOptionCard";

type FreightOptionsProps = {
  options: OpcaoFrete[];
  selectedOption: OpcaoFrete | null;
  onSelect: (option: OpcaoFrete) => void;
};

export function FreightOptions({ options, selectedOption, onSelect }: FreightOptionsProps) {
  return (
    <div className="frete-opcoes">
      {options.map((option) => (
        <FreightOptionCard
          key={`${option.codigoServico}-${option.servico}`}
          option={option}
          selected={
            selectedOption?.codigoServico === option.codigoServico &&
            selectedOption?.servico === option.servico
          }
          onSelect={() => onSelect(option)}
        />
      ))}
    </div>
  );
}
