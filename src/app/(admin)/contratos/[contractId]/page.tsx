import { notFound } from "next/navigation";
import { CheckCircle2, PauseCircle, ReceiptText } from "lucide-react";
import {
  activateContractAction,
  createContractItemAction,
  createContractScopeAction,
  createExternalResourceAction,
  suspendContractAction,
  updateContractAction,
} from "@/core/actions/contract-actions";
import { listModuleRows, listProductRows } from "@/core/repositories/catalog-repository";
import {
  getContractRowById,
  listContractItemRows,
  listContractScopeRows,
  listExternalResourceRows,
  listPlanRows,
} from "@/core/repositories/contract-repository";
import { listTenantRows } from "@/core/repositories/tenant-repository";
import { ContractCommercialForms } from "@/components/contract-commercial-forms";
import { ContractForm } from "@/components/contract-form";
import { DataPanel } from "@/components/data-panel";
import { InfoCard } from "@/components/info-card";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";

interface ContratoDetailPageProps {
  params: Promise<{
    contractId: string;
  }>;
  searchParams: Promise<{
    contractAction?: string;
  }>;
}

export default async function ContratoDetailPage({ params, searchParams }: ContratoDetailPageProps) {
  const { contractId } = await params;
  const { contractAction } = await searchParams;
  const [contract, tenants, plans, contractItems, contractScopes, products, modules] = await Promise.all([
    getContractRowById(contractId),
    listTenantRows(),
    listPlanRows(),
    listContractItemRows(contractId),
    listContractScopeRows(contractId),
    listProductRows(),
    listModuleRows(),
  ]);

  if (!contract) {
    notFound();
  }

  const updateAction = updateContractAction.bind(null, contract.id);
  const activateAction = activateContractAction.bind(null, contract.id);
  const suspendAction = suspendContractAction.bind(null, contract.id);
  const createItemAction = createContractItemAction.bind(null, contract.id, contract.tenantId);
  const createScopeAction = createContractScopeAction.bind(null, contract.id, contract.tenantId);
  const createResourceAction = createExternalResourceAction.bind(null, contract.id, contract.tenantId);
  const externalResources = await listExternalResourceRows(contract.tenantId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// Contratos"
        title={contract.tenantName}
        description="Detalhe do contrato, plano contratado, status comercial e limite operacional do tenant."
        action={<StatusPill status={contract.status} />}
      />

      {contractAction ? (
        <div className="rounded-lg border border-[var(--border-b)] bg-[rgba(37,99,235,0.08)] p-4 text-[13.5px] text-[var(--text2)]">
          Ação simulada em modo mock: <span className="font-mono text-[var(--blue-xl)]">{contractAction}</span>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Plano" value={contract.planName} detail={contract.planCode} />
        <InfoCard label="Assinatura" value={contract.subscriptionStatus} detail={contract.period} />
        <InfoCard label="Contrato" value={contract.contractNumber} detail={billingCycleLabel(contract.billingCycle)} />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <DataPanel eyebrow="// Itens" title="Itens contratuais">
          <div className="divide-y divide-[var(--border)]">
            {contractItems.map((item) => (
              <div key={item.id} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-[14px] font-semibold text-[var(--text)]">{item.description}</p>
                  <p className="mt-1 text-[12.5px] text-[var(--text2)]">
                    {item.productName} · {item.moduleName} · {billingModelLabel(item.billingModel)}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:justify-end">
                  <span className="font-mono text-[12px] text-[var(--text2)]">
                    {item.quantity} × {item.billingLabel}
                  </span>
                  <StatusPill status={item.status} />
                </div>
              </div>
            ))}
            {contractItems.length === 0 ? (
              <p className="p-5 text-[13.5px] text-[var(--text2)]">Nenhum item contratual registrado.</p>
            ) : null}
          </div>
        </DataPanel>

        <DataPanel eyebrow="// Escopos" title="Recursos cobertos">
          <div className="divide-y divide-[var(--border)]">
            {contractScopes.map((scope) => (
              <div key={scope.id} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-[14px] font-semibold text-[var(--text)]">{scope.displayName}</p>
                  <p className="mt-1 text-[12.5px] text-[var(--text2)]">
                    {scope.productName} · {scope.resourceType}:{scope.resourceId}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:justify-end">
                  <span className="font-mono text-[12px] text-[var(--text2)]">{scope.periodLabel}</span>
                  <StatusPill status={scope.status} />
                </div>
              </div>
            ))}
            {contractScopes.length === 0 ? (
              <p className="p-5 text-[13.5px] text-[var(--text2)]">Nenhum recurso específico coberto.</p>
            ) : null}
          </div>
        </DataPanel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <DataPanel eyebrow="// Recursos" title="Recursos externos do tenant">
          <div className="divide-y divide-[var(--border)]">
            {externalResources.map((resource) => (
              <div key={resource.id} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-[14px] font-semibold text-[var(--text)]">
                    {resource.displayName ?? resource.code}
                  </p>
                  <p className="mt-1 text-[12.5px] text-[var(--text2)]">
                    {resource.productName} · {resource.resourceType}:{resource.externalId}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:justify-end">
                  <span className="font-mono text-[12px] text-[var(--text2)]">{resource.code}</span>
                  <StatusPill status={resource.status} />
                </div>
              </div>
            ))}
            {externalResources.length === 0 ? (
              <p className="p-5 text-[13.5px] text-[var(--text2)]">Nenhum recurso externo registrado.</p>
            ) : null}
          </div>
        </DataPanel>

        <DataPanel eyebrow="// Cadastro" title="Adicionar composição">
          <div className="p-5">
            <ContractCommercialForms
              contractItems={contractItems}
              createExternalResourceAction={createResourceAction}
              createItemAction={createItemAction}
              createScopeAction={createScopeAction}
              externalResources={externalResources}
              modules={modules}
              products={products}
              startDate={contract.startDate}
            />
          </div>
        </DataPanel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <DataPanel eyebrow="// Contract form" title="Editar contrato">
          <div className="p-5">
            <ContractForm
              action={updateAction}
              contract={contract}
              plans={plans}
              submitLabel="Salvar alterações"
              tenants={tenants}
            />
          </div>
        </DataPanel>

        <DataPanel eyebrow="// Status" title="Operação">
          <div className="space-y-4 p-5">
            <div className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
              <ReceiptText size={18} strokeWidth={1.4} className="mt-1 text-[var(--blue-xl)]" />
              <p className="text-[13.5px] leading-6 text-[var(--text2)]">
                O contrato define vigência comercial; a assinatura e limites complementam o controle de acesso.
              </p>
            </div>
            <form action={activateAction}>
              <button className="btn btn-outline w-full" type="submit">
                <CheckCircle2 size={15} />
                Ativar contrato
              </button>
            </form>
            <form action={suspendAction}>
              <button className="btn btn-outline w-full" type="submit">
                <PauseCircle size={15} />
                Suspender contrato
              </button>
            </form>
          </div>
        </DataPanel>
      </section>
    </div>
  );
}

function billingCycleLabel(value: string) {
  const labels: Record<string, string> = {
    monthly: "Mensal",
    quarterly: "Trimestral",
    yearly: "Anual",
    trial: "Trial",
  };

  return labels[value] ?? value;
}

function billingModelLabel(value: string) {
  const labels: Record<string, string> = {
    flat_fee: "Valor fixo",
    per_user: "Por usuário",
    per_resource: "Por recurso",
    usage_based: "Por uso",
    included: "Incluso",
  };

  return labels[value] ?? value;
}
