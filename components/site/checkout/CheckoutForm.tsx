"use client";

import type { CartShippingState } from "@/hooks/site/useCartShipping";
import type { CheckoutState } from "@/hooks/site/useCheckout";
import type { TotaisPedido } from "@/types";
import { CheckoutActions } from "./CheckoutActions";
import { CheckoutAddressForm } from "./CheckoutAddressForm";
import { CheckoutCustomerForm } from "./CheckoutCustomerForm";
import { CheckoutDeliverySection } from "./CheckoutDeliverySection";
import { CheckoutObservations } from "./CheckoutObservations";
import { CheckoutOrderSummary } from "./CheckoutOrderSummary";
import { CheckoutPaymentSelector } from "./CheckoutPaymentSelector";

type CheckoutFormProps = {
  checkout: CheckoutState;
  shipping: CartShippingState;
  subtotal: number;
  totals: TotaisPedido;
  onCepChange: (cep: string) => void;
  onSubmit: () => void;
};

/// Seções do checkout, na ordem em que aparecem abaixo dos itens:
/// dados, endereço, entrega (com resumo), pagamento, observações e envio.
export function CheckoutForm({
  checkout,
  shipping,
  subtotal,
  totals,
  onCepChange,
  onSubmit,
}: CheckoutFormProps) {
  return (
    <>
      <CheckoutCustomerForm
        cliente={checkout.cliente}
        onNomeChange={checkout.alterarNome}
        onTelefoneChange={checkout.alterarTelefone}
      />

      <CheckoutAddressForm
        endereco={checkout.endereco}
        statusCep={checkout.statusCep}
        onCepChange={onCepChange}
        onCampoChange={checkout.alterarCampoEndereco}
      />

      <CheckoutDeliverySection
        cep={checkout.endereco.cep}
        loading={shipping.calculando}
        error={shipping.erroFrete}
        localDelivery={shipping.freteLocal}
        options={shipping.opcoes}
        selectedOption={shipping.escolhida}
        onCalculate={() => void shipping.calcularFrete()}
        onSelectOption={shipping.selecionarOpcao}
      >
        {shipping.escolhida && (
          <CheckoutOrderSummary
            subtotal={subtotal}
            shipping={shipping.escolhida.preco}
            paymentMethod={checkout.formaPagamento}
            installments={checkout.parcelas}
            totals={totals}
          />
        )}
      </CheckoutDeliverySection>

      <CheckoutPaymentSelector
        paymentMethod={checkout.formaPagamento}
        installments={checkout.parcelas}
        baseTotal={totals.totalBase}
        onPaymentMethodChange={checkout.alterarFormaPagamento}
        onInstallmentsChange={checkout.alterarParcelas}
      />

      <CheckoutObservations value={checkout.observacoes} onChange={checkout.alterarObservacoes} />

      <CheckoutActions showValidationError={checkout.mostrarErroValidacao} onSubmit={onSubmit} />
    </>
  );
}
