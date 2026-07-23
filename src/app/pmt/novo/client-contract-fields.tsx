"use client";

import { useMemo, useState } from "react";

const coreClients = [
  {
    id: "tenant-gerdau",
    name: "Cliente Gerdau",
    contracts: [
      { id: "CTR-BTT-2026-014", label: "CTR-BTT-2026-014 - Diagnóstico de manutenção industrial" },
      { id: "CTR-BTT-2026-015", label: "CTR-BTT-2026-015 - Expansão de escopo BTT" }
    ],
    units: [
      { id: "gerdau-ouro-branco", label: "Ouro Branco - Usina principal" },
      { id: "gerdau-oficina-central", label: "Oficina central de manutenção" }
    ]
  },
  {
    id: "tenant-eneva",
    name: "Cliente Eneva",
    contracts: [
      { id: "CTR-BTT-2026-022", label: "CTR-BTT-2026-022 - Manutenção térmica" }
    ],
    units: [
      { id: "eneva-termeletrica", label: "Termelétrica - Unidade operacional" }
    ]
  }
];

export function ClientContractFields() {
  const [clientId, setClientId] = useState(coreClients[0].id);

  const selectedClient = useMemo(
    () => coreClients.find((client) => client.id === clientId) ?? coreClients[0],
    [clientId]
  );

  return (
    <div className="form-grid">
      <input type="hidden" name="coreTenantId" value={selectedClient.id} />
      <label>
        Cliente
        <select
          name="client"
          required
          value={selectedClient.name}
          onChange={(event) => {
            const nextClient = coreClients.find((client) => client.name === event.target.value);
            if (nextClient) setClientId(nextClient.id);
          }}
        >
          {coreClients.map((client) => (
            <option key={client.id} value={client.name}>{client.name}</option>
          ))}
        </select>
        <small>Origem futura: tenants/empresas permitidas no Core.</small>
      </label>
      <label>
        Contrato / escopo BTT
        <select name="coreContractId" key={selectedClient.id} defaultValue={selectedClient.contracts[0]?.id}>
          {selectedClient.contracts.map((contract) => (
            <option key={contract.id} value={contract.id}>{contract.label}</option>
          ))}
        </select>
        <small>Lista filtrada pelo cliente selecionado, como será no Supabase/Core.</small>
      </label>
      <label>
        Nome do projeto BTT
        <input name="name" required maxLength={120} placeholder="BTT Cliente - Manutenção Industrial - Julho 2026" />
      </label>
      <label>
        Planta / unidade
        <select name="plant" required key={`${selectedClient.id}-unit`} defaultValue={selectedClient.units[0]?.label}>
          {selectedClient.units.map((unit) => (
            <option key={unit.id} value={unit.label}>{unit.label}</option>
          ))}
        </select>
      </label>
      <label className="full-field">
        Objetivo do estudo
        <textarea name="objective" placeholder="Ex.: medir produtividade da manutenção, identificar perdas e estimar ganhos de organização, planejamento e execução." />
      </label>
      <label>
        Início
        <input name="periodStart" required type="date" />
      </label>
      <label>
        Fim
        <input name="periodEnd" required type="date" />
      </label>
    </div>
  );
}
