"use client";

import type { ReactNode } from "react";
import { Truck } from "@phosphor-icons/react";
import { cepCompleto } from "@/lib/checkout/validacao";
import { mascararCEP } from "@/lib/utils";
import type { OpcaoFrete } from "@/types";
import { FreightOptions } from "../frete/FreightOptions";
import { LocalDeliveryNotice } from "../frete/LocalDeliveryNotice";

type CheckoutDeliverySectionProps = {
  cep: string;
  loading: boolean;
  error: string | null;
  localDelivery: boolean;
  options: OpcaoFrete[] | null;
  selectedOption: OpcaoFrete | null;
  onCalculate: () => void;
  onSelectOption: (option: OpcaoFrete) => void;
  children?: ReactNode;
};

/// Frete do checkout. Usa as mesmas opções e o mesmo aviso de entrega
/// local do modal, mas não o ShippingCalculator: aqui o CEP vem do
/// formulário de endereço (só exibido, sem campo próprio) e o botão
/// fica desabilitado até o CEP estar completo.
export function CheckoutDeliverySection({
  cep,
  loading,
  error,
  localDelivery,
  options,
  selectedOption,
  onCalculate,
  onSelectOption,
  children,
}: CheckoutDeliverySectionProps) {
  return (
    <section className="shipping-box">
      <h3 className="shipping-title">
        <Truck weight="bold" />
        Calcular entrega
      </h3>
      <div className="shipping-input-row">
        <p className="shipping-cep-atual">
          {cep ? `Frete para o CEP ${mascararCEP(cep)}` : "Informe o CEP acima para calcular o frete"}
        </p>
        <button
          type="button"
          className={`btn-calcular-frete ${loading ? "is-loading" : ""}`}
          onClick={onCalculate}
          disabled={loading || !cepCompleto(cep)}
        >
          {loading ? "Calculando" : "Calcular"}
        </button>
      </div>

      {error && <p className="mensagem-erro">{error}</p>}
      {localDelivery && <LocalDeliveryNotice />}
      {options && (
        <FreightOptions options={options} selectedOption={selectedOption} onSelect={onSelectOption} />
      )}
      {children}
    </section>
  );
}
