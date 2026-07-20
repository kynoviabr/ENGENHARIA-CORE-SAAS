import { FileClock } from "lucide-react";
import Link from "next/link";
import { DataPanel } from "@/components/data-panel";
import { InfoCard } from "@/components/info-card";
import { PageHeader } from "@/components/page-header";
import { listAuditLogListRows } from "@/core/repositories/audit-repository";

export default async function AuditoriaPage() {
  const logs = await listAuditLogListRows();
  const entityTypes = new Set(logs.map((log) => log.entityType));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// Auditoria"
        title="Eventos administrativos"
        description="Consulta de eventos relevantes do Core, com tenant, ator, entidade e metadados para rastreabilidade."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Eventos" value={logs.length.toString()} detail="Últimos registros disponíveis." />
        <InfoCard label="Entidades" value={entityTypes.size.toString()} detail="Tipos de alvo auditados." />
        <InfoCard label="Fonte" value="audit_logs" detail="Tabela preparada no Supabase." />
      </section>

      <DataPanel eyebrow="// Audit logs" title="Linha do tempo">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--border)] font-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--text3)]">
                <th className="px-5 py-3 font-medium">Evento</th>
                <th className="px-5 py-3 font-medium">Tenant</th>
                <th className="px-5 py-3 font-medium">Ator</th>
                <th className="px-5 py-3 font-medium">Entidade</th>
                <th className="px-5 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr className="border-b border-[var(--border)] last:border-0" key={log.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <FileClock size={17} strokeWidth={1.4} className="text-[var(--blue-xl)]" />
                      <Link
                        className="font-mono text-[13px] font-semibold hover:text-[var(--blue-xl)]"
                        href={`/auditoria/${log.id}`}
                      >
                        {log.action}
                      </Link>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[13.5px] text-[var(--text2)]">{log.tenantName}</td>
                  <td className="px-5 py-4 text-[13.5px] text-[var(--text2)]">{log.actorName}</td>
                  <td className="px-5 py-4 font-mono text-[12px] text-[var(--text3)]">
                    {log.entityType}
                  </td>
                  <td className="px-5 py-4 font-mono text-[12px] text-[var(--text3)]">
                    {formatDateTime(log.createdAt)}
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

function formatDateTime(value: string): string {
  return value.replace("T", " ").replace(":00Z", "");
}
