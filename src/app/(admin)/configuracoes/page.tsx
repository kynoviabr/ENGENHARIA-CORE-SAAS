import { Palette, Settings } from "lucide-react";
import Link from "next/link";
import { DataPanel } from "@/components/data-panel";
import { InfoCard } from "@/components/info-card";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { platformSettings } from "@/lib/core-data";
import { getDataSourceMode } from "@/core/repositories";
import { listBrandingListRows } from "@/core/repositories/settings-repository";
import { listTenantRows } from "@/core/repositories/tenant-repository";

interface ConfiguracoesPageProps {
  searchParams: Promise<{
    settingsAction?: string;
  }>;
}

export default async function ConfiguracoesPage({ searchParams }: ConfiguracoesPageProps) {
  const { settingsAction } = await searchParams;
  const dataSourceMode = getDataSourceMode();
  const [tenants, branding] = await Promise.all([listTenantRows(), listBrandingListRows()]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// Configurações"
        title="Parâmetros da plataforma"
        description="Configurações globais do Core, incluindo políticas de tenant ativo, branding, auditoria e ambiente de dados."
      />

      {settingsAction ? (
        <div className="rounded-lg border border-[var(--border-b)] bg-[var(--accent-soft)] p-4 text-[13.5px] text-[var(--text2)]">
          Ação simulada em modo mock: <span className="font-mono text-[var(--blue-xl)]">{settingsAction}</span>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Tenant context" value="Obrigatório" detail="Base para isolamento de dados." />
        <InfoCard label="Branding" value={branding.length.toString()} detail="Configurações por empresa." />
        <InfoCard
          label="Fonte de dados"
          value={dataSourceMode === "supabase" ? "Supabase" : "Mock"}
          detail="Troca automática via variáveis .env."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <DataPanel eyebrow="// Branding" title="Branding por tenant">
          <div className="divide-y divide-[var(--border)]">
            {tenants.map((tenant) => {
              const tenantBranding = branding.find((item) => item.tenantId === tenant.id);

              return (
                <article
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                  key={tenant.id}
                >
                  <div className="flex items-start gap-3">
                    <Palette size={18} strokeWidth={1.4} className="mt-1 text-[var(--blue-xl)]" />
                    <div>
                      <Link
                        className="text-[14px] font-semibold  hover:text-[var(--blue-xl)]"
                        href={`/configuracoes/branding/${tenant.id}`}
                      >
                        {tenant.tradeName}
                      </Link>
                      <p className="mt-2 text-[13.5px] leading-6 text-[var(--text2)]">
                        {tenantBranding?.name ?? "Sem branding configurado"}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="pill pill-blue">{tenantBranding?.primaryColor ?? "#1E4066"}</span>
                        <span className="pill pill-blue">{tenantBranding?.supportEmail || "sem suporte"}</span>
                      </div>
                    </div>
                  </div>
                  <StatusPill status={tenant.status} />
                </article>
              );
            })}
          </div>
        </DataPanel>

        <DataPanel eyebrow="// Platform" title="Parâmetros gerais">
          <div className="divide-y divide-[var(--border)]">
            {platformSettings.map((setting) => (
              <article
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                key={setting.label}
              >
                <div className="flex items-start gap-3">
                  <Settings size={18} strokeWidth={1.4} className="mt-1 text-[var(--blue-xl)]" />
                  <div>
                    <h2 className="text-[14px] font-semibold ">{setting.label}</h2>
                    <p className="mt-2 text-[13.5px] leading-6 text-[var(--text2)]">{setting.detail}</p>
                  </div>
                </div>
                <span className="pill pill-blue w-fit">{setting.value}</span>
              </article>
            ))}
          </div>
        </DataPanel>
      </section>
    </div>
  );
}
