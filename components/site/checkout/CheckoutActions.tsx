"use client";

import { MapPin } from "@phosphor-icons/react";
import { WhatsAppIcon } from "../WhatsAppIcon";

type CheckoutActionsProps = {
  showValidationError: boolean;
  onSubmit: () => void;
};

export function CheckoutActions({ showValidationError, onSubmit }: CheckoutActionsProps) {
  return (
    <>
      {showValidationError && (
        <p className="mensagem-erro">
          <MapPin weight="bold" aria-hidden="true" />
          Preencha nome, telefone e endereço completo (CEP, rua, número, bairro, cidade e UF)
          para continuar.
        </p>
      )}

      <button type="button" className="btn-whatsapp-modal btn-enviar-pedido" onClick={onSubmit}>
        <WhatsAppIcon />
        Comprar pelo WhatsApp
      </button>
    </>
  );
}
