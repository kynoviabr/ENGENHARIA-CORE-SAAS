import { createRoleAction } from "@/core/actions/access-actions";
import { listPermissionRows } from "@/core/repositories/access-repository";
import { listTenantRows } from "@/core/repositories/tenant-repository";
import { DataPanel } from "@/components/data-panel";
import { PageHeader } from "@/components/page-header";
import { RoleForm } from "@/components/role-form";

export default async function NovoPapelPage() {
  const [permissions, tenants] = await Promise.all([listPermissionRows(), listTenantRows()]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// Acesso"
        title="Novo papel"
        description="Cadastro de papel RBAC e seleção de permissões aplicadas no contexto do tenant."
      />

      <DataPanel eyebrow="// Role form" title="Dados do papel">
        <div className="p-5">
          <RoleForm
            action={createRoleAction}
            permissions={permissions}
            submitLabel="Criar papel"
            tenants={tenants}
          />
        </div>
      </DataPanel>
    </div>
  );
}
