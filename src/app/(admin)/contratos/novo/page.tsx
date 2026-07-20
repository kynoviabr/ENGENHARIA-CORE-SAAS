import { createContractAction } from "@/core/actions/contract-actions";
import { listPlanRows } from "@/core/repositories/contract-repository";
import { listTenantRows } from "@/core/repositories/tenant-repository";
import { ContractForm } from "@/components/contract-form";
import { DataPanel } from "@/components/data-panel";
import { PageHeader } from "@/components/page-header";

export default async function NovoContratoPage() {
  const [tenants, plans] = await Promise.all([listTenantRows(), listPlanRows()]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// Contratos"
        title="Novo contrato"
        description="Cadastro da vigência comercial e plano base usado para controlar limites do tenant."
      />

      <DataPanel eyebrow="// Contract form" title="Dados comerciais">
        <div className="p-5">
          <ContractForm
            action={createContractAction}
            plans={plans}
            submitLabel="Criar contrato"
            tenants={tenants}
          />
        </div>
      </DataPanel>
    </div>
  );
}
