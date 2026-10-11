"use client";

import { CreditCard, QrCode } from "@phosphor-icons/react";
import { PARCELAS_MAXIMAS } from "@/config/pagamentos";
import { calcularParcela, calcularValorCredito, formatarBRL } from "@/lib/utils";
import type { FormaPagamento } from "@/types";

type CheckoutPaymentSelectorProps = {
  paymentMethod: FormaPagamento;
  installments: number;
  /// Produtos + frete: base de cálculo de cada opção de parcelamento.
  baseTotal: number;
  onPaymentMethodChange: (method: FormaPagamento) => void;
  onInstallmentsChange: (installments: number) => void;
};

const OPCOES_PARCELAS = Array.from({ length: PARCELAS_MAXIMAS }, (_, indice) => indice + 1);

export function CheckoutPaymentSelector({
  paymentMethod,
  installments,
  baseTotal,
  onPaymentMethodChange,
  onInstallmentsChange,
}: CheckoutPaymentSelectorProps) {
  return (
    <fieldset className="form-fieldset">
      <legend>Forma de pagamento</legend>
      <div className="payment-method-pills" role="group" aria-label="Forma de pagamento">
        <button
          type="button"
          className={`payment-pill ${paymentMethod === "pix" ? "active" : ""}`}
          onClick={() => onPaymentMethodChange("pix")}
        >
          <QrCode weight="bold" aria-hidden="true" />
          Pix
        </button>
        <button
          type="button"
          className={`payment-pill ${paymentMethod === "credito" ? "active" : ""}`}
          onClick={() => onPaymentMethodChange("credito")}
        >
          <CreditCard weight="bold" aria-hidden="true" />
          Cartão de crédito
        </button>
      </div>

      {paymentMethod === "pix" && (
        <p className="payment-pix-total">
          Total no Pix: <strong>{formatarBRL(baseTotal)}</strong>
        </p>
      )}

      {paymentMethod === "credito" && (
        <div className="installment-options" role="group" aria-label="Número de parcelas">
          {OPCOES_PARCELAS.map((n) => (
            <button
              type="button"
              key={n}
              className={`installment-pill ${installments === n ? "active" : ""}`}
              onClick={() => onInstallmentsChange(n)}
            >
              <span className="installment-pill-parcelas">
                {n}x de {formatarBRL(calcularParcela(baseTotal, n))}
              </span>
              {n > 1 && (
                <span className="installment-pill-total">
                  Total {formatarBRL(calcularValorCredito(baseTotal, n))}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </fieldset>
  );
}
