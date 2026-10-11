import { Car } from "@phosphor-icons/react";

export function LocalDeliveryNotice() {
  return (
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
  );
}
