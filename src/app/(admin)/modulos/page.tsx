import { Layers3, Plus } from "lucide-react";
import Link from "next/link";
import { DataPanel } from "@/components/data-panel";
import { InfoCard } from "@/components/info-card";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import {
  listEntitlementListRows,
  listModuleListRows,
  listProductRows,
} from "@/core/repositories/catalog-repository";

interface ModulosPageProps {
  searchParams: Promise<{
    catalogAction?: string;
  }>;
}

export default async function ModulosPage({ searchParams }: ModulosPageProps) {
  const { catalogAction } = await searchParams;
  const [products, productModules, entitlements] = await Promise.all([
    listProductRows(),
    listModuleListRows(),
    listEntitlementListRows(),
  ]);
  const summary = {
    products: products.length,
    modules: productModules.length,
    entitlements: entitlements.length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// Módulos"
        title="Catálogo genérico"
        description="Produtos e módulos do Core ficam genéricos. A ativação por empresa será controlada por entitlements."
        action={
          <Link className="btn btn-primary" href="/modulos/entitlements/novo">
            <Plus size={15} />
            Novo entitlement
          </Link>
        }
      />

      {catalogAction ? (
        <div className="rounded-lg border border-[var(--border-b)] bg-[var(--accent-soft)] p-4 text-[13.5px] text-[var(--text2)]">
          Ação simulada em modo mock: <span className="font-mono text-[var(--blue-xl)]">{catalogAction}</span>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Produtos" value={summary.products.toString()} detail="core-platform como base inicial." />
        <InfoCard label="Módulos" value={summary.modules.toString()} detail="Catálogo preparado para planos." />
        <InfoCard label="Entitlements" value={summary.entitlements.toString()} detail="Liberações por tenant." />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <DataPanel eyebrow="// Catalog" title="Módulos disponíveis">
          <div className="grid gap-px bg-[var(--border)] md:grid-cols-2">
            {productModules.map((module) => (
              <article className="bg-[var(--bg2)] p-5 transition hover:bg-[var(--bg3)]" key={module.id}>
                <div className="flex items-start justify-between gap-3">
                  <Layers3 size={32} strokeWidth={1.3} className="text-[var(--blue-xl)]" />
                  <StatusPill status={module.status} />
                </div>
                <Link
                  className="mt-5 block text-[15px] font-semibold  hover:text-[var(--blue-xl)]"
                  href={`/módulos/${module.id}`}
                >
                  {module.name}
                </Link>
                <div className="mt-3 font-mono text-[12px] text-[var(--text3)]">
                  {module.productCode}/{module.code}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="pill pill-blue">{module.activeEntitlementCount} ativos</span>
                  <span className="pill pill-blue">{module.entitlementCount} tenants</span>
                </div>
              </article>
            ))}
          </div>
        </DataPanel>

        <DataPanel eyebrow="// Entitlements" title="Liberações recentes">
          <div className="divide-y divide-[var(--border)]">
            {entitlements.slice(0, 6).map((entitlement) => (
              <article className="p-4" key={entitlement.id}>
                <div className="flex items-start justify-between gap-3">
                  <Link
                    className="text-[13.5px] font-semibold hover:text-[var(--blue-xl)]"
                    href={`/módulos/entitlements/${entitlement.id}`}
                  >
                    {entitlement.tenantName}
                  </Link>
                  <StatusPill status={entitlement.status} />
                </div>
                <div className="mt-2 font-mono text-[11.5px] text-[var(--text3)]">
                  {entitlement.productCode}/{entitlement.moduleCode}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="pill pill-blue">{entitlement.source}</span>
                  <span className="pill pill-blue">{entitlement.startsAt.slice(0, 10)}</span>
                </div>
              </article>
            ))}
          </div>
        </DataPanel>
      </section>
    </div>
  );
}
