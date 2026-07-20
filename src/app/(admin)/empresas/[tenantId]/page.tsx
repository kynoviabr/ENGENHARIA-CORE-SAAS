import { notFound } from "next/navigation";
import { Building2, CheckCircle2, PauseCircle } from "lucide-react";
import {
  activateTenantAction,
  suspendTenantAction,
  updateTenantAction,
} from "@/core/actions/tenant-actions";
import { getTenantRowById } from "@/core/repositories/tenant-repository";
import { DataPanel } from "@/components/data-panel";
import { InfoCard } from "@/components/info-card";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { TenantForm } from "@/components/tenant-form";

interface TenantDetailPageProps {
  params: Promise<{
    tenantId: string;
  }>;
  searchParams: Promise<{
    tenantAction?: string;
  }>;
}

export default async function TenantDetailPage({ params, searchParams }: TenantDetailPageProps) {
  const { tenantId } = await params;
  const { tenantAction } = await searchParams;
  const tenant = await getTenantRowById(tenantId);

  if (!tenant) {
    notFound();
  }

  const updateAction = updateTenantAction.bind(null, tenant.id);
  const activateAction = activateTenantAction.bind(null, tenant.id);
  const suspendAction = suspendTenantAction.bind(null, tenant.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// Empresas"
        title={tenant.tradeName}
        description="Detalhe do tenant, status operacional e dados cadastrais usados como base para acesso multitenant."
        action={<StatusPill status={tenant.status} />}
      />

      {tenantAction ? (
        <div className="rounded-lg border border-[var(--border-b)] bg-[rgba(37,99,235,0.08)] p-4 text-[13.5px] text-[var(--text2)]">
          Ação simulada em modo mock: <span className="font-mono text-[var(--blue-xl)]">{tenantAction}</span>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Documento" value={tenant.document} detail={tenant.legalName} />
        <InfoCard label="Contato" value={tenant.email} detail={tenant.phone || "Sem telefone"} />
        <InfoCard label="Tenant ID" value={tenant.id} detail="Identificador usado no contexto ativo." />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <DataPanel eyebrow="// Tenant form" title="Editar empresa">
          <div className="p-5">
            <TenantForm action={updateAction} submitLabel="Salvar alterações" tenant={tenant} />
          </div>
        </DataPanel>

        <DataPanel eyebrow="// Status" title="Operação">
          <div className="space-y-4 p-5">
            <div className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
              <Building2 size={18} strokeWidth={1.4} className="mt-1 text-[var(--blue-xl)]" />
              <p className="text-[13.5px] leading-6 text-[var(--text2)]">
                O status da empresa define se usuários vinculados podem acessar recursos do Core.
              </p>
            </div>
            <form action={activateAction}>
              <button className="btn btn-outline w-full" type="submit">
                <CheckCircle2 size={15} />
                Ativar tenant
              </button>
            </form>
            <form action={suspendAction}>
              <button className="btn btn-outline w-full" type="submit">
                <PauseCircle size={15} />
                Suspender tenant
              </button>
            </form>
          </div>
        </DataPanel>
      </section>
    </div>
  );
}
