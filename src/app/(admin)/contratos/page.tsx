import { CreditCard, Plus } from "lucide-react";
import Link from "next/link";
import { DataPanel } from "@/components/data-panel";
import { InfoCard } from "@/components/info-card";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { listContractListRows } from "@/core/repositories/contract-repository";

interface ContratosPageProps {
  searchParams: Promise<{
    contractAction?: string;
  }>;
}

export default async function ContratosPage({ searchParams }: ContratosPageProps) {
  const { contractAction } = await searchParams;
  const contracts = await listContractListRows();
  const summary = {
    total: contracts.length,
    trial: contracts.filter((item) => item.subscriptionStatus === "trial").length,
    suspended: contracts.filter((item) => item.subscriptionStatus === "suspended").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// Contratos"
        title="Planos, assinaturas e limites"
        description="Camada comercial genérica para controlar vigência operacional, planos, assinaturas, limites e liberações por tenant."
        action={
          <Link className="btn btn-primary" href="/contratos/novo">
            <Plus size={15} />
            Novo contrato
          </Link>
        }
      />

      {contractAction ? (
        <div className="rounded-lg border border-[var(--border-b)] bg-[rgba(37,99,235,0.08)] p-4 text-[13.5px] text-[var(--text2)]">
          Ação simulada em modo mock: <span className="font-mono text-[var(--blue-xl)]">{contractAction}</span>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Contratos" value={summary.total.toString()} detail="Registros mockados para desenho inicial." />
        <InfoCard label="Trial" value={summary.trial.toString()} detail="Assinatura temporaria em onboarding." />
        <InfoCard label="Suspensos" value={summary.suspended.toString()} detail="Bloqueio por status comercial." />
      </section>

      <DataPanel eyebrow="// Subscriptions" title="Contratos monitorados">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--border)] font-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--text3)]">
                <th className="px-5 py-3 font-medium">Tenant</th>
                <th className="px-5 py-3 font-medium">Plano</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Periodo</th>
                <th className="px-5 py-3 font-medium">Limite</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr className="border-b border-[var(--border)] last:border-0" key={contract.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <CreditCard size={17} strokeWidth={1.4} className="text-[var(--blue-xl)]" />
                      <Link
                        className="text-[14px] font-semibold tracking-[-0.2px] hover:text-[var(--blue-xl)]"
                        href={`/contratos/${contract.id}`}
                      >
                        {contract.tenantName}
                      </Link>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[13.5px] text-[var(--text2)]">{contract.planName}</td>
                  <td className="px-5 py-4">
                    <StatusPill status={contract.subscriptionStatus} />
                  </td>
                  <td className="px-5 py-4 font-mono text-[12px] text-[var(--text3)]">{contract.period}</td>
                  <td className="px-5 py-4 text-[13.5px] text-[var(--text2)]">{contract.limitLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataPanel>
    </div>
  );
}
