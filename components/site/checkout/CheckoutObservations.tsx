"use client";

type CheckoutObservationsProps = {
  value: string;
  onChange: (value: string) => void;
};

export function CheckoutObservations({ value, onChange }: CheckoutObservationsProps) {
  return (
    <fieldset className="form-fieldset">
      <legend>
        Observações <span className="campo-opcional">(opcional)</span>
      </legend>
      <div className="form-group">
        <textarea
          rows={3}
          placeholder="Alguma preferência, mensagem para o cartão, horário de entrega…"
          value={value}
          onChange={(evento) => onChange(evento.target.value)}
        />
      </div>
    </fieldset>
  );
}
