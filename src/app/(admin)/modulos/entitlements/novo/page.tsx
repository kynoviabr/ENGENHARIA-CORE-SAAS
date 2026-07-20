import { createEntitlementAction } from "@/core/actions/catalog-actions";
import { listModuleRows, listProductRows } from "@/core/repositories/catalog-repository";
import { listTenantRows } from "@/core/repositories/tenant-repository";
import { DataPanel } from "@/components/data-panel";
import { EntitlementForm } from "@/components/entitlement-form";
import { PageHeader } from "@/components/page-header";

export default async function NovoEntitlementPage() {
  const [tenants, products, modules] = await Promise.all([
    listTenantRows(),
    listProductRows(),
    listModuleRows(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// Módulos"
        title="Novo entitlement"
        description="Liberação de produto ou módulo para um tenant, com origem, status e vigência operacional."
      />

      <DataPanel eyebrow="// Entitlement form" title="Dados da liberação">
        <div className="p-5">
          <EntitlementForm
            action={createEntitlementAction}
            modules={modules}
            products={products}
            submitLabel="Criar entitlement"
            tenants={tenants}
          />
        </div>
      </DataPanel>
    </div>
  );
}
