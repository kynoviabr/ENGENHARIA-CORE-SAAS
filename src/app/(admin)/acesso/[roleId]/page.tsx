import { notFound } from "next/navigation";
import { KeyRound, ShieldCheck, UsersRound } from "lucide-react";
import { updateRoleAction } from "@/core/actions/access-actions";
import { getRoleRowById, listPermissionRows, listRoleListRows } from "@/core/repositories/access-repository";
import { listTenantRows } from "@/core/repositories/tenant-repository";
import { DataPanel } from "@/components/data-panel";
import { InfoCard } from "@/components/info-card";
import { PageHeader } from "@/components/page-header";
import { RoleForm } from "@/components/role-form";

interface PapelDetailPageProps {
  params: Promise<{
    roleId: string;
  }>;
  searchParams: Promise<{
    accessAction?: string;
  }>;
}

export default async function PapelDetailPage({ params, searchParams }: PapelDetailPageProps) {
  const { roleId } = await params;
  const { accessAction } = await searchParams;
  const [role, roleList, permissions, tenants] = await Promise.all([
    getRoleRowById(roleId),
    listRoleListRows(),
    listPermissionRows(),
    listTenantRows(),
  ]);

  if (!role) {
    notFound();
  }

  const roleStats = roleList.find((item) => item.id === role.id);
  const updateAction = updateRoleAction.bind(null, role.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// Acesso"
        title={role.name}
        description="Detalhe do papel, escopo de aplicação e permissões usadas pela autorização central."
        action={<span className="pill pill-blue">{role.scope}</span>}
      />

      {accessAction ? (
        <div className="rounded-lg border border-[var(--border-b)] bg-[var(--accent-soft)] p-4 text-[13.5px] text-[var(--text2)]">
          Ação simulada em modo mock: <span className="font-mono text-[var(--blue-xl)]">{accessAction}</span>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Tenant" value={roleStats?.tenantName ?? "Global"} detail={role.tenantId ?? "Escopo global"} />
        <InfoCard label="Permissões" value={role.permissionIds.length.toString()} detail="Ações vinculadas ao papel." />
        <InfoCard label="Membros" value={(roleStats?.memberCount ?? 0).toString()} detail="Usuários com atribuição." />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <DataPanel eyebrow="// Role form" title="Editar papel">
          <div className="p-5">
            <RoleForm
              action={updateAction}
              permissions={permissions}
              role={role}
              submitLabel="Salvar alterações"
              tenants={tenants}
            />
          </div>
        </DataPanel>

        <DataPanel eyebrow="// CheckAccess" title="Contrato de acesso">
          <div className="space-y-3 p-5">
            <AccessLine icon={ShieldCheck} label="Permissão" value="platform.*" />
            <AccessLine icon={UsersRound} label="Contexto" value="tenant_id + user_id" />
            <AccessLine icon={KeyRound} label="Avaliação" value="checkAccess()" />
          </div>
        </DataPanel>
      </section>
    </div>
  );
}

interface AccessLineProps {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
}

function AccessLine({ icon: Icon, label, value }: AccessLineProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-3">
      <Icon size={16} strokeWidth={1.5} className="text-[var(--blue-xl)]" />
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">{label}</div>
        <div className="mt-1 font-mono text-[12px] text-[var(--text2)]">{value}</div>
      </div>
    </div>
  );
}
