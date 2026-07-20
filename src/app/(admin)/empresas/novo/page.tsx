import { createTenantAction } from "@/core/actions/tenant-actions";
import { DataPanel } from "@/components/data-panel";
import { PageHeader } from "@/components/page-header";
import { TenantForm } from "@/components/tenant-form";

export default function NovaEmpresaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// Empresas"
        title="Nova empresa"
        description="Cadastro inicial de tenant. Em modo mock, o envio simula o fluxo e redireciona para a listagem."
      />

      <DataPanel eyebrow="// Tenant form" title="Dados cadastrais">
        <div className="p-5">
          <TenantForm action={createTenantAction} submitLabel="Criar empresa" />
        </div>
      </DataPanel>
    </div>
  );
}
