import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCheck, RotateCcw } from "lucide-react";
import { requirePermission } from "@/core/auth/session";
import { StatusBadge } from "@/features/pmt/components/status-badge";
import { getActivityCode } from "@/features/pmt/services/activity-codes";
import { formatDuration } from "@/features/pmt/services/calculations";
import { getDailyReportWorkspace } from "@/features/pmt/services/queries";

export default async function DailyReportDetailPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const session = await requirePermission("pmt.daily_reports.view");
  const workspace = await getDailyReportWorkspace(session.activeTenant.id, reportId);

  if (!workspace) notFound();

  const { report, employee, study, entries } = workspace;

  return (
    <div className="page-stack">
      <section className="page-heading compact">
        <div>
          <span className="eyebrow">{report.reportDate} / {report.shift}</span>
          <h1>Diário de {employee?.fullName ?? report.employeeId}</h1>
          <p>{study?.name} | {employee?.team} | {employee?.discipline} | {formatDuration(report.totalReportedSeconds)}</p>
        </div>
        <div className="button-row">
          <button className="secondary-button" type="button"><RotateCcw size={17} /> Reclassificar</button>
          <button className="primary-button" type="button"><CheckCheck size={17} /> Validar diário</button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">
          <h2>Itens apontados</h2>
          <StatusBadge value={report.status} />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Horário</th>
                <th>OS / serviço</th>
                <th>Código BTT</th>
                <th>Duração</th>
                <th>Observação</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.sequence}</td>
                  <td>{entry.startTime} - {entry.endTime}</td>
                  <td>{entry.workOrder}</td>
                  <td>
                    <span className="code-pill">{entry.activityCode}</span>
                    <small>{getActivityCode(entry.activityCode)?.label}</small>
                  </td>
                  <td>{formatDuration(entry.durationSeconds)}</td>
                  <td>{entry.note ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">
          <h2>Rastreabilidade</h2>
          <span>input original do funcionário</span>
        </div>
        <div className="governance-grid">
          <div><span>Funcionário</span><strong>{employee?.employeeCode}</strong></div>
          <div><span>Função</span><strong>{employee?.hierarchyLevel} - {employee?.role}</strong></div>
          <div><span>Custo</span><strong>{employee?.costType === "direct" ? "Direto" : "Indireto"}</strong></div>
          <div><span>Área</span><strong>{employee?.maintenanceArea}</strong></div>
          <div><span>Enviado em</span><strong>{report.submittedAt ?? "Rascunho"}</strong></div>
          <div><span>Validado em</span><strong>{report.validatedAt ?? "Pendente"}</strong></div>
          <div><span>Nota de validação</span><strong>{report.validationNote ?? "Sem nota"}</strong></div>
        </div>
      </section>

      <Link href="/pmt/diarios" className="text-link">Voltar para diários</Link>
    </div>
  );
}
