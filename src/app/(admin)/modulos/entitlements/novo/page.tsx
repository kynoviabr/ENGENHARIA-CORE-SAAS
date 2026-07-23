import { createEntitlementAction } from "@/core/actions/catalog-actions";
import { listProductRows } from "@/core/repositories/catalog-repository";
import { listContractListRows } from "@/core/repositories/contract-repository";
import { listTenantRows } from "@/core/repositories/tenant-repository";
import { DataPanel } from "@/components/data-panel";
import { EntitlementForm } from "@/components/entitlement-form";
import { PageHeader } from "@/components/page-header";

export default async function NovoEntitlementPage() {
  const [tenants, products, contracts] = await Promise.all([
    listTenantRows(),
    listProductRows(),
    listContractListRows(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// Sistemas"
        title="Nova liberação"
        description="Liberação de sistema para um cliente, vinculada ao contrato e à vigência operacional."
      />

      <DataPanel eyebrow="// Liberação" title="Dados da liberação">
        <div className="p-5">
          <EntitlementForm
            action={createEntitlementAction}
            contracts={contracts}
            products={products}
            submitLabel="Criar liberação"
            tenants={tenants}
          />
        </div>
      </DataPanel>
    </div>
  );
}
