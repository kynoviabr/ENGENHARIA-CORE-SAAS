import { createUserMembershipAction } from "@/core/actions/user-actions";
import { listPermissionRows, listRoleRows } from "@/core/repositories/access-repository";
import { listEntitlementListRows, listProductRows } from "@/core/repositories/catalog-repository";
import { listTenantRows } from "@/core/repositories/tenant-repository";
import { DataPanel } from "@/components/data-panel";
import { PageHeader } from "@/components/page-header";
import { UserMembershipForm } from "@/components/user-membership-form";

export default async function NovoUsuarioPage() {
  const [tenants, roles, permissions, products, entitlements] = await Promise.all([
    listTenantRows(),
    listRoleRows(),
    listPermissionRows(),
    listProductRows(),
    listEntitlementListRows(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// Usuários"
        title="Gestão de Usuarios"
        description="Selecione a empresa, o sistema liberado e o perfil de acesso do usuário."
      />

      <DataPanel eyebrow="// Membership form" title="Dados do usuário">
        <div className="p-5">
          <UserMembershipForm
            action={createUserMembershipAction}
            entitlements={entitlements}
            permissions={permissions}
            products={products}
            roles={roles}
            submitLabel="Enviar convite"
            tenants={tenants}
          />
        </div>
      </DataPanel>
    </div>
  );
}
