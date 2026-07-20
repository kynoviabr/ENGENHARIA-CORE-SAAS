import { Building2, Plus } from "lucide-react";
import Link from "next/link";
import { DataPanel } from "@/components/data-panel";
import { InfoCard } from "@/components/info-card";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { getTenantSummary, listTenants } from "@/core/services";

export default function EmpresasPage() {
  const tenants = listTenants();
  const summary = getTenantSummary();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// Empresas"
        title="Tenants e organizações"
        description="Cadastro central de empresas, status operacional, limites contratados e isolamento por tenant_id."
        action={
          <Link className="btn btn-primary" href="/empresas/novo">
            <Plus size={15} />
            Nova empresa
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Empresas ativas" value={summary.active.toString()} detail="Tenants liberados para acesso." />
        <InfoCard label="Em análise" value={summary.pending.toString()} detail="Onboarding aguardando validação." />
        <InfoCard label="Bloqueios" value={summary.suspended.toString()} detail="Acesso suspenso por status comercial." />
      </section>

      <DataPanel eyebrow="// Tenant registry" title="Empresas cadastradas">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--border)] font-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--text3)]">
                <th className="px-5 py-3 font-medium">Empresa</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Usuários</th>
                <th className="px-5 py-3 font-medium">Plano</th>
                <th className="px-5 py-3 font-medium">Renovação</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr className="border-b border-[var(--border)] last:border-0" key={tenant.name}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-b)] bg-[rgba(37,99,235,0.09)] text-[var(--blue-xl)]">
                        <Building2 size={17} strokeWidth={1.4} />
                      </div>
                      <div>
                        <Link
                          className="text-[14px] font-semibold tracking-[-0.2px] hover:text-[var(--blue-xl)]"
                          href={`/empresas/${tenant.id}`}
                        >
                          {tenant.name}
                        </Link>
                        <div className="mt-1 font-mono text-[11px] text-[var(--text3)]">
                          {tenant.document}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <StatusPill status={tenant.status} />
                  </td>
                  <td className="px-5 py-4 text-[13.5px] text-[var(--text2)]">{tenant.users}</td>
                  <td className="px-5 py-4 text-[13.5px] text-[var(--text2)]">{tenant.plan}</td>
                  <td className="px-5 py-4 font-mono text-[12px] text-[var(--text3)]">
                    {tenant.renewal}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataPanel>
    </div>
  );
}
