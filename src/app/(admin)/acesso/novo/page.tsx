import { createRoleAction } from "@/core/actions/access-actions";
import { listPermissionRows } from "@/core/repositories/access-repository";
import { listProductRows } from "@/core/repositories/catalog-repository";
import { DataPanel } from "@/components/data-panel";
import { PageHeader } from "@/components/page-header";
import { RoleForm } from "@/components/role-form";

export default async function NovoPapelPage() {
  const [permissions, products] = await Promise.all([listPermissionRows(), listProductRows()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administração de Perfis de Acesso"
        description="Selecione o sistema e configure o perfil que depois será aplicado aos usuários dos clientes."
      />

      <DataPanel title="Sistema">
        <div className="p-4">
          <RoleForm
            action={createRoleAction}
            permissions={permissions}
            products={products}
            submitLabel="Criar perfil"
          />
        </div>
      </DataPanel>
    </div>
  );
}
