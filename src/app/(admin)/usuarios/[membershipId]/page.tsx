import { notFound } from "next/navigation";
import { CheckCircle2, PauseCircle, UserRound } from "lucide-react";
import {
  activateUserMembershipAction,
  suspendUserMembershipAction,
  updateUserMembershipAction,
} from "@/core/actions/user-actions";
import { listRoleRows } from "@/core/repositories/access-repository";
import { listTenantRows } from "@/core/repositories/tenant-repository";
import { getUserMembershipRowById } from "@/core/repositories/user-repository";
import { DataPanel } from "@/components/data-panel";
import { InfoCard } from "@/components/info-card";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { UserMembershipForm } from "@/components/user-membership-form";

interface UsuarioDetailPageProps {
  params: Promise<{
    membershipId: string;
  }>;
  searchParams: Promise<{
    userAction?: string;
  }>;
}

export default async function UsuarioDetailPage({ params, searchParams }: UsuarioDetailPageProps) {
  const { membershipId } = await params;
  const { userAction } = await searchParams;
  const [membership, tenants, roles] = await Promise.all([
    getUserMembershipRowById(membershipId),
    listTenantRows(),
    listRoleRows(),
  ]);

  if (!membership) {
    notFound();
  }

  const updateAction = updateUserMembershipAction.bind(null, membership.membershipId);
  const activateAction = activateUserMembershipAction.bind(null, membership.membershipId);
  const suspendAction = suspendUserMembershipAction.bind(null, membership.membershipId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// Usuários"
        title={membership.name}
        description="Detalhe do usuário, vínculo com tenant e papel usado pela autorização RBAC."
        action={<StatusPill status={membership.status} />}
      />

      {userAction ? (
        <div className="rounded-lg border border-[var(--border-b)] bg-[rgba(37,99,235,0.08)] p-4 text-[13.5px] text-[var(--text2)]">
          Ação simulada em modo mock: <span className="font-mono text-[var(--blue-xl)]">{userAction}</span>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label="E-mail" value={membership.email} detail={`Usuário: ${membership.userId}`} />
        <InfoCard label="Empresa" value={membership.tenant} detail={`Tenant: ${membership.tenantId}`} />
        <InfoCard label="Papel" value={membership.role} detail="Atribuição no contexto do tenant." />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <DataPanel eyebrow="// Membership form" title="Editar vínculo">
          <div className="p-5">
            <UserMembershipForm
              action={updateAction}
              membership={membership}
              roles={roles}
              submitLabel="Salvar alterações"
              tenants={tenants}
            />
          </div>
        </DataPanel>

        <DataPanel eyebrow="// Status" title="Operação">
          <div className="space-y-4 p-5">
            <div className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
              <UserRound size={18} strokeWidth={1.4} className="mt-1 text-[var(--blue-xl)]" />
              <p className="text-[13.5px] leading-6 text-[var(--text2)]">
                O status do vínculo controla o acesso do usuário aos recursos daquela empresa.
              </p>
            </div>
            <form action={activateAction}>
              <button className="btn btn-outline w-full" type="submit">
                <CheckCircle2 size={15} />
                Ativar vínculo
              </button>
            </form>
            <form action={suspendAction}>
              <button className="btn btn-outline w-full" type="submit">
                <PauseCircle size={15} />
                Suspender vínculo
              </button>
            </form>
          </div>
        </DataPanel>
      </section>
    </div>
  );
}
