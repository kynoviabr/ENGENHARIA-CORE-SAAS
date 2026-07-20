import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { getModuleRowById, listEntitlementListRows } from "@/core/repositories/catalog-repository";
import { DataPanel } from "@/components/data-panel";
import { InfoCard } from "@/components/info-card";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";

interface ModuleDetailPageProps {
  params: Promise<{
    moduleId: string;
  }>;
}

export default async function ModuleDetailPage({ params }: ModuleDetailPageProps) {
  const { moduleId } = await params;
  const [module, entitlements] = await Promise.all([
    getModuleRowById(moduleId),
    listEntitlementListRows(),
  ]);

  if (!module) {
    notFound();
  }

  const moduleEntitlements = entitlements.filter((item) => item.moduleId === module.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// Módulos"
        title={module.name}
        description={module.description}
        action={<StatusPill status={module.status} />}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Produto" value={module.productName} detail={module.productCode} />
        <InfoCard label="Entitlements" value={module.entitlementCount.toString()} detail="Liberações totais." />
        <InfoCard label="Ativos" value={module.activeEntitlementCount.toString()} detail="Tenants com acesso ativo." />
      </section>

      <DataPanel eyebrow="// Entitlements" title="Tenants com acesso">
        <div className="flex justify-end border-b border-[var(--border)] p-4">
          <Link className="btn btn-primary" href="/modulos/entitlements/novo">
            <Plus size={15} />
            Novo entitlement
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--border)] font-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--text3)]">
                <th className="px-5 py-3 font-medium">Tenant</th>
                <th className="px-5 py-3 font-medium">Origem</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Inicio</th>
                <th className="px-5 py-3 font-medium">Expira</th>
              </tr>
            </thead>
            <tbody>
              {moduleEntitlements.map((entitlement) => (
                <tr className="border-b border-[var(--border)] last:border-0" key={entitlement.id}>
                  <td className="px-5 py-4">
                    <Link
                      className="text-[14px] font-semibold  hover:text-[var(--blue-xl)]"
                      href={`/módulos/entitlements/${entitlement.id}`}
                    >
                      {entitlement.tenantName}
                    </Link>
                  </td>
                  <td className="px-5 py-4 font-mono text-[12px] text-[var(--text3)]">{entitlement.source}</td>
                  <td className="px-5 py-4">
                    <StatusPill status={entitlement.status} />
                  </td>
                  <td className="px-5 py-4 font-mono text-[12px] text-[var(--text3)]">
                    {entitlement.startsAt.slice(0, 10)}
                  </td>
                  <td className="px-5 py-4 font-mono text-[12px] text-[var(--text3)]">
                    {entitlement.expiresAt?.slice(0, 10) ?? "-"}
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
