import { notFound } from "next/navigation";
import { FileClock, Fingerprint, UserRound } from "lucide-react";
import { DataPanel } from "@/components/data-panel";
import { InfoCard } from "@/components/info-card";
import { PageHeader } from "@/components/page-header";
import { getAuditLogRowById } from "@/core/repositories/audit-repository";

interface AuditoriaDetailPageProps {
  params: Promise<{
    auditId: string;
  }>;
}

export default async function AuditoriaDetailPage({ params }: AuditoriaDetailPageProps) {
  const { auditId } = await params;
  const log = await getAuditLogRowById(auditId);

  if (!log) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// Auditoria"
        title={log.action}
        description="Detalhe do evento auditado, incluindo alvo, ator e metadados registrados."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Tenant" value={log.tenantName} detail={log.tenantId ?? "Evento de plataforma"} />
        <InfoCard label="Ator" value={log.actorName} detail={log.actorUserId ?? "Sistema"} />
        <InfoCard label="Criado em" value={log.createdAt.slice(0, 10)} detail={formatDateTime(log.createdAt)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <DataPanel eyebrow="// Metadata" title="Metadados">
          <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-6 text-[var(--text2)]">
            {JSON.stringify(log.metadata, null, 2)}
          </pre>
        </DataPanel>

        <DataPanel eyebrow="// Target" title="Entidade">
          <div className="space-y-3 p-5">
            <AuditLine icon={FileClock} label="Ação" value={log.action} />
            <AuditLine icon={Fingerprint} label="Tipo" value={log.entityType} />
            <AuditLine icon={UserRound} label="ID" value={log.entityId ?? "-"} />
          </div>
        </DataPanel>
      </section>
    </div>
  );
}

interface AuditLineProps {
  icon: typeof FileClock;
  label: string;
  value: string;
}

function AuditLine({ icon: Icon, label, value }: AuditLineProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-3">
      <Icon size={16} strokeWidth={1.5} className="text-[var(--blue-xl)]" />
      <div className="min-w-0">
        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">{label}</div>
        <div className="mt-1 break-words font-mono text-[12px] text-[var(--text2)]">{value}</div>
      </div>
    </div>
  );
}

function formatDateTime(value: string): string {
  return value.replace("T", " ").replace(":00Z", "");
}
