import Link from "next/link";
import { Plus } from "lucide-react";
import { coreStore } from "@/core/mock-store";
import { listContracts, listTenants } from "@/core/services";
import { CoreDashboardWorkspace } from "./core-dashboard-workspace";

export default function Home() {
  const tenants = listTenants();
  const contracts = listContracts();
  const systems = coreStore.products.map((product) => {
    const modules = coreStore.modules.filter((module) => module.productId === product.id);
    const entitlements = coreStore.entitlements.filter((entitlement) => entitlement.productId === product.id);

    return {
      id: product.id,
      name: product.name,
      code: product.code,
      status: product.status,
      modules: modules.length,
      tenants: new Set(entitlements.map((entitlement) => entitlement.tenantId)).size,
    };
  });
  const projects = coreStore.contractScopes.map((scope) => {
    const tenant = coreStore.tenants.find((item) => item.id === scope.tenantId);
    const product = coreStore.products.find((item) => item.id === scope.productId);
    const contract = coreStore.contracts.find((item) => item.id === scope.contractId);

    return {
      id: scope.id,
      name: scope.displayName ?? scope.resourceCode,
      client: tenant?.tradeName ?? "Cliente não encontrado",
      product: product?.name ?? "Sistema não encontrado",
      contract: contract?.contractNumber ?? "Contrato não encontrado",
      status: scope.status,
      period: `${scope.startsAt} / ${scope.expiresAt ?? "sem término"}`,
    };
  });

  return (
    <div className="space-y-6">
      <section className="page-card flex flex-col gap-5 p-5 lg:flex-row lg:items-end lg:justify-between lg:p-6">
        <div>
          <div className="section-label">Core Admin</div>
          <h1 className="mt-2 text-[30px] font-semibold leading-tight text-[var(--text)] md:text-[36px]">
            Painel
          </h1>
          <p className="mt-3 max-w-2xl text-[14px] leading-6 text-[var(--text2)]">
            Visão geral dos clientes, contratos, sistemas e projetos em andamento na plataforma.
          </p>
        </div>
        <Link className="btn btn-primary w-fit" href="/empresas/novo">
          <Plus size={15} />
          Novo cliente
        </Link>
      </section>

      <CoreDashboardWorkspace
        tenants={tenants}
        contracts={contracts}
        systems={systems}
        projects={projects}
      />
    </div>
  );
}
