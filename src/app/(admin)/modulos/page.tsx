import { Box, Layers3, Plus, ShieldCheck } from "lucide-react";
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
  const activeProducts = products.filter((product) => product.status === "active").length;
  const activeEntitlements = entitlements.filter((entitlement) => entitlement.status === "active").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// Sistemas"
        title="Sistemas e módulos"
        description="Cadastre os sistemas acoplados ao Core, organize seus módulos internos e libere o acesso por cliente."
        action={
          <div className="flex flex-wrap gap-3">
            <Link className="btn btn-outline" href="/modulos/entitlements/novo">
              <ShieldCheck size={15} />
              Nova liberação
            </Link>
            <Link className="btn btn-primary" href="/modulos/sistemas/novo">
              <Plus size={15} />
              Novo sistema
            </Link>
          </div>
        }
      />

      {catalogAction ? (
        <div className="rounded-lg border border-[var(--border-b)] bg-[var(--accent-soft)] p-4 text-[13.5px] text-[var(--text2)]">
          Ação simulada em modo mock: <span className="font-mono text-[var(--blue-xl)]">{catalogAction}</span>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Sistemas cadastrados" value={products.length.toString()} detail={`${activeProducts} ativos`} />
        <InfoCard label="Módulos internos" value={productModules.length.toString()} detail="Funcionalidades por sistema." />
        <InfoCard label="Clientes liberados" value={activeEntitlements.toString()} detail="Liberações ativas." />
      </section>

      <DataPanel eyebrow="// Sistemas" title="Sistemas cadastrados">
        <div className="divide-y divide-[var(--border)]">
          {products.length === 0 ? (
            <EmptyState
              actionHref="/modulos/sistemas/novo"
              actionLabel="Cadastrar sistema"
              description="Cadastre o primeiro sistema acoplado ao Core, como BTT, para depois criar módulos e liberar acesso por cliente."
              title="Nenhum sistema cadastrado"
            />
          ) : null}
          {products.map((product) => {
            const modules = productModules.filter((module) => module.productId === product.id);
            const productEntitlements = entitlements.filter((entitlement) => entitlement.productId === product.id);

            return (
              <article className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]" key={product.id}>
                <div className="flex items-start gap-3">
                  <Box size={20} strokeWidth={1.4} className="mt-1 text-[var(--blue-xl)]" />
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-[15px] font-semibold">{product.name}</h2>
                      <StatusPill status={product.status} />
                    </div>
                    <p className="mt-2 max-w-3xl text-[13.5px] leading-6 text-[var(--text2)]">{product.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="pill pill-blue">{product.code}</span>
                      <span className="pill pill-blue">{modules.length} módulos</span>
                      <span className="pill pill-blue">{productEntitlements.length} liberações</span>
                    </div>
                  </div>
                </div>
                <Link className="btn btn-outline h-9 px-3 text-[13px]" href="/modulos/entitlements/novo">
                  Liberar para cliente
                </Link>
              </article>
            );
          })}
        </div>
      </DataPanel>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <DataPanel eyebrow="// Módulos" title="Módulos por sistema">
          <div className="grid gap-px bg-[var(--border)] md:grid-cols-2">
            {productModules.length === 0 ? (
              <div className="bg-[var(--bg2)] md:col-span-2">
                <EmptyState
                  description="Depois de cadastrar um sistema, cadastre os módulos internos que poderão ser liberados separadamente por cliente."
                  title="Nenhum módulo cadastrado"
                />
              </div>
            ) : null}
            {productModules.map((module) => (
              <article className="bg-[var(--bg2)] p-5 transition hover:bg-[var(--bg3)]" key={module.id}>
                <div className="flex items-start justify-between gap-3">
                  <Layers3 size={28} strokeWidth={1.3} className="text-[var(--blue-xl)]" />
                  <StatusPill status={module.status} />
                </div>
                <Link
                  className="mt-5 block text-[15px] font-semibold hover:text-[var(--blue-xl)]"
                  href={`/modulos/${module.id}`}
                >
                  {module.name}
                </Link>
                <p className="mt-2 text-[13px] leading-6 text-[var(--text2)]">{module.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="pill pill-blue">{module.productCode}/{module.code}</span>
                  <span className="pill pill-blue">{module.activeEntitlementCount} ativos</span>
                </div>
              </article>
            ))}
          </div>
        </DataPanel>

        <DataPanel eyebrow="// Liberações" title="Liberações recentes">
          <div className="divide-y divide-[var(--border)]">
            {entitlements.length === 0 ? (
              <EmptyState
                actionHref="/modulos/entitlements/novo"
                actionLabel="Criar liberação"
                description="As liberações conectam cliente, contrato, sistema e módulo. Sem elas, o cliente não acessa o sistema."
                title="Nenhuma liberação cadastrada"
              />
            ) : null}
            {entitlements.slice(0, 6).map((entitlement) => (
              <article className="p-4" key={entitlement.id}>
                <div className="flex items-start justify-between gap-3">
                  <Link
                    className="text-[13.5px] font-semibold hover:text-[var(--blue-xl)]"
                    href={`/modulos/entitlements/${entitlement.id}`}
                  >
                    {entitlement.tenantName}
                  </Link>
                  <StatusPill status={entitlement.status} />
                </div>
                <div className="mt-2 text-[12.5px] text-[var(--text2)]">{entitlement.productName}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="pill pill-blue">Contrato</span>
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

function EmptyState({
  actionHref,
  actionLabel,
  description,
  title,
}: {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  title: string;
}) {
  return (
    <div className="p-5">
      <h3 className="text-[14px] font-semibold text-[var(--text)]">{title}</h3>
      <p className="mt-2 text-[13.5px] leading-6 text-[var(--text2)]">{description}</p>
      {actionHref && actionLabel ? (
        <Link className="btn btn-outline mt-4 h-9 w-fit px-3 text-[13px]" href={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
