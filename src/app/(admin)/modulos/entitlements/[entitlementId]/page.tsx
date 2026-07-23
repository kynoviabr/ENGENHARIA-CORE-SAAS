import { notFound } from "next/navigation";
import { CheckCircle2, Layers3, PauseCircle } from "lucide-react";
import {
  activateEntitlementAction,
  suspendEntitlementAction,
  updateEntitlementAction,
} from "@/core/actions/catalog-actions";
import {
  getEntitlementRowById,
  listProductRows,
} from "@/core/repositories/catalog-repository";
import { listContractListRows } from "@/core/repositories/contract-repository";
import { listTenantRows } from "@/core/repositories/tenant-repository";
import { DataPanel } from "@/components/data-panel";
import { EntitlementForm } from "@/components/entitlement-form";
import { InfoCard } from "@/components/info-card";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";

interface EntitlementDetailPageProps {
  params: Promise<{
    entitlementId: string;
  }>;
  searchParams: Promise<{
    catalogAction?: string;
  }>;
}

export default async function EntitlementDetailPage({
  params,
  searchParams,
}: EntitlementDetailPageProps) {
  const { entitlementId } = await params;
  const { catalogAction } = await searchParams;
  const [entitlement, tenants, products, contracts] = await Promise.all([
    getEntitlementRowById(entitlementId),
    listTenantRows(),
    listProductRows(),
    listContractListRows(),
  ]);

  if (!entitlement) {
    notFound();
  }

  const updateAction = updateEntitlementAction.bind(null, entitlement.id);
  const activateAction = activateEntitlementAction.bind(null, entitlement.id);
  const suspendAction = suspendEntitlementAction.bind(null, entitlement.id);
  const contract = contracts.find((item) => item.id === entitlement.sourceId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// Sistemas"
        title={entitlement.tenantName}
        description="Detalhe da liberação de sistema para um cliente, vinculada ao contrato e à vigência operacional."
        action={<StatusPill status={entitlement.status} />}
      />

      {catalogAction ? (
        <div className="rounded-lg border border-[var(--border-b)] bg-[var(--accent-soft)] p-4 text-[13.5px] text-[var(--text2)]">
          Ação simulada em modo mock: <span className="font-mono text-[var(--blue-xl)]">{catalogAction}</span>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        <InfoCard label="Sistema" value={entitlement.productName} detail={entitlement.productCode} />
        <InfoCard label="Contrato" value={contract?.contractNumber ?? "Não vinculado"} detail={contract?.tenantName ?? "Contrato obrigatório"} />
        <InfoCard label="Origem" value="Contrato" detail={entitlement.startsAt.slice(0, 10)} />
        <InfoCard
          label="Vigência"
          value={entitlement.expiresAt?.slice(0, 10) ?? "Sem término"}
          detail="Controle contratual do acesso"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <DataPanel eyebrow="// Liberação" title="Editar liberação">
          <div className="p-5">
            <EntitlementForm
              action={updateAction}
              contracts={contracts}
              entitlement={entitlement}
              products={products}
              submitLabel="Salvar alterações"
              tenants={tenants}
            />
          </div>
        </DataPanel>

        <DataPanel eyebrow="// Status" title="Operação">
          <div className="space-y-4 p-5">
            <div className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
              <Layers3 size={18} strokeWidth={1.4} className="mt-1 text-[var(--blue-xl)]" />
              <p className="text-[13.5px] leading-6 text-[var(--text2)]">
                A liberação é a última camada antes do checkAccess liberar sistema, módulo ou recurso para o cliente.
              </p>
            </div>
            <form action={activateAction}>
              <button className="btn btn-outline w-full" type="submit">
                <CheckCircle2 size={15} />
                Ativar liberação
              </button>
            </form>
            <form action={suspendAction}>
              <button className="btn btn-outline w-full" type="submit">
                <PauseCircle size={15} />
                Suspender liberação
              </button>
            </form>
          </div>
        </DataPanel>
      </section>
    </div>
  );
}
