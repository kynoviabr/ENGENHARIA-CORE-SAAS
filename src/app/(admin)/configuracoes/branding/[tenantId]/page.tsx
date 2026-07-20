import { notFound } from "next/navigation";
import { saveBrandingAction } from "@/core/actions/settings-actions";
import { getBrandingRowByTenantId } from "@/core/repositories/settings-repository";
import { listTenantRows } from "@/core/repositories/tenant-repository";
import { BrandingForm } from "@/components/branding-form";
import { DataPanel } from "@/components/data-panel";
import { InfoCard } from "@/components/info-card";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";

interface BrandingDetailPageProps {
  params: Promise<{
    tenantId: string;
  }>;
  searchParams: Promise<{
    settingsAction?: string;
  }>;
}

export default async function BrandingDetailPage({ params, searchParams }: BrandingDetailPageProps) {
  const { tenantId } = await params;
  const { settingsAction } = await searchParams;
  const [tenants, branding] = await Promise.all([
    listTenantRows(),
    getBrandingRowByTenantId(tenantId),
  ]);
  const tenant = tenants.find((item) => item.id === tenantId);

  if (!tenant) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// Configurações"
        title={tenant.tradeName}
        description="Configuração visual e canais de suporte aplicados ao tenant ativo."
        action={<StatusPill status={tenant.status} />}
      />

      {settingsAction ? (
        <div className="rounded-lg border border-[var(--border-b)] bg-[rgba(37,99,235,0.08)] p-4 text-[13.5px] text-[var(--text2)]">
          Ação simulada em modo mock: <span className="font-mono text-[var(--blue-xl)]">{settingsAction}</span>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Nome" value={branding?.name ?? tenant.tradeName} detail={tenant.legalName} />
        <InfoCard label="Cor primaria" value={branding?.primaryColor ?? "#2563EB"} detail="Token visual do tenant." />
        <InfoCard label="Suporte" value={branding?.supportEmail || tenant.email} detail={branding?.supportPhone || tenant.phone} />
      </section>

      <DataPanel eyebrow="// Branding form" title="Editar branding">
        <div className="p-5">
          <BrandingForm
            action={saveBrandingAction}
            branding={branding}
            selectedTenantId={tenant.id}
            submitLabel="Salvar branding"
            tenants={tenants}
          />
        </div>
      </DataPanel>
    </div>
  );
}
