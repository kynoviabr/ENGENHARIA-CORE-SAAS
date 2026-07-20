import { createUserMembershipAction } from "@/core/actions/user-actions";
import { listRoleRows } from "@/core/repositories/access-repository";
import { listTenantRows } from "@/core/repositories/tenant-repository";
import { DataPanel } from "@/components/data-panel";
import { PageHeader } from "@/components/page-header";
import { UserMembershipForm } from "@/components/user-membership-form";

export default async function NovoUsuarioPage() {
  const [tenants, roles] = await Promise.all([listTenantRows(), listRoleRows()]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// Usuários"
        title="Convidar usuário"
        description="Cadastro inicial de identidade e vínculo com empresa. Em modo mock, o envio simula o convite."
      />

      <DataPanel eyebrow="// Membership form" title="Dados do usuário">
        <div className="p-5">
          <UserMembershipForm
            action={createUserMembershipAction}
            roles={roles}
            submitLabel="Enviar convite"
            tenants={tenants}
          />
        </div>
      </DataPanel>
    </div>
  );
}
