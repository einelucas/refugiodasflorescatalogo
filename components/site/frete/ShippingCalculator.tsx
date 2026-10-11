"use client";

import type { ReactNode } from "react";
import { Truck } from "@phosphor-icons/react";
import type { OpcaoFrete } from "@/types";
import { FreightOptions } from "./FreightOptions";
import { LocalDeliveryNotice } from "./LocalDeliveryNotice";

type ShippingCalculatorProps = {
  cep: string;
  loading: boolean;
  error: string | null;
  localDelivery: boolean;
  options: OpcaoFrete[] | null;
  selectedOption: OpcaoFrete | null;
  onCepChange: (value: string) => void;
  onCalculate: () => void;
  onSelectOption: (option: OpcaoFrete) => void;
  children?: ReactNode;
};

export function ShippingCalculator({
  cep,
  loading,
  error,
  localDelivery,
  options,
  selectedOption,
  onCepChange,
  onCalculate,
  onSelectOption,
  children,
}: ShippingCalculatorProps) {
  return (
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
          onChange={(event) => onCepChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onCalculate();
          }}
          aria-label="CEP para entrega"
        />
        <button
          type="button"
          className={`btn-calcular-frete ${loading ? "is-loading" : ""}`}
          onClick={onCalculate}
          disabled={loading}
        >
          {loading ? "Calculando" : "Calcular"}
        </button>
      </div>

      {error && <p className="mensagem-erro">{error}</p>}
      {localDelivery && <LocalDeliveryNotice />}
      {options && (
        <FreightOptions
          options={options}
          selectedOption={selectedOption}
          onSelect={onSelectOption}
        />
      )}
      {children}
    </section>
  );
}
