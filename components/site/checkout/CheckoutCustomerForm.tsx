"use client";

import type { DadosCliente } from "@/types";

type CheckoutCustomerFormProps = {
  cliente: DadosCliente;
  onNomeChange: (nome: string) => void;
  /// Recebe o valor digitado; a máscara é aplicada por quem controla o estado.
  onTelefoneChange: (telefone: string) => void;
};

export function CheckoutCustomerForm({
  cliente,
  onNomeChange,
  onTelefoneChange,
}: CheckoutCustomerFormProps) {
  return (
    <fieldset className="form-fieldset">
      <legend>Seus dados</legend>
      <div className="form-group">
        <label htmlFor="carrinhoNome">Nome completo</label>
        <input
          id="carrinhoNome"
          placeholder="Seu nome"
          value={cliente.nome}
          onChange={(evento) => onNomeChange(evento.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="carrinhoTelefone">Telefone (WhatsApp)</label>
        <input
          id="carrinhoTelefone"
          type="tel"
          placeholder="(00) 00000-0000"
          value={cliente.telefone}
          onChange={(evento) => onTelefoneChange(evento.target.value)}
        />
      </div>
    </fieldset>
  );
}
