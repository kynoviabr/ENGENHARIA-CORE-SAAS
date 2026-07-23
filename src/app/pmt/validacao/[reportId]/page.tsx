import { notFound } from "next/navigation";
import { CheckCheck, CircleAlert, XCircle } from "lucide-react";
import { requirePermission } from "@/core/auth/session";
import { rejectDailyReportAction, reclassifyDailyReportEntryAction, validateDailyReportAction } from "@/features/pmt/actions/validation-actions";
import { StatusBadge } from "@/features/pmt/components/status-badge";
import { activityCodes, getActivityCode } from "@/features/pmt/services/activity-codes";
import { formatDuration } from "@/features/pmt/services/calculations";
import { getDailyReportWorkspace } from "@/features/pmt/services/queries";

export default async function ValidationDetailPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const session = await requirePermission("pmt.daily_reports.validate");
  const workspace = await getDailyReportWorkspace(session.activeTenant.id, reportId);

  if (!workspace) notFound();

  const { report, employee, study, entries } = workspace;
  const totalSeconds = entries.reduce((sum, entry) => sum + entry.durationSeconds, 0);
  const qualityFlags = getQualityFlags(entries);
  const productiveSeconds = entries
    .filter((entry) => getActivityCode(entry.activityCode)?.group === "productive")
    .reduce((sum, entry) => sum + entry.durationSeconds, 0);
  const lossSeconds = entries
    .filter((entry) => getActivityCode(entry.activityCode)?.group === "loss")
    .reduce((sum, entry) => sum + entry.durationSeconds, 0);

  return (
    <div className="page-stack">
      <section className="page-heading compact">
        <div>
          <span className="eyebrow">Revisão metodológica</span>
          <h1>Validar diário de {employee?.fullName ?? report.employeeId}</h1>
          <p>{study?.name} | {report.reportDate} | {report.shift} | {formatDuration(totalSeconds)}</p>
        </div>
        <StatusBadge value={report.status} />
      </section>

      <section className="metrics-grid">
        <MetricLike label="Tempo total" value={formatDuration(totalSeconds)} hint="somatório do diário" />
        <MetricLike label="Produtivo" value={formatDuration(productiveSeconds)} hint="códigos de execução" />
        <MetricLike label="Perdas" value={formatDuration(lossSeconds)} hint="esperas, retrabalho e interferências" />
        <MetricLike label="Alertas" value={String(qualityFlags.length)} hint="checagem automática" />
      </section>

      <section className="content-grid validation-layout">
        <div className="panel wide">
          <div className="panel-title">
            <h2>Itens do diário</h2>
            <span>reclassificação exige justificativa</span>
          </div>
          <div className="validation-list">
            {entries.map((entry) => (
              <article key={entry.id} className="validation-item">
                <div className="validation-item-main">
                  <span className="code-pill">{entry.activityCode}</span>
                  <div>
                    <h3>{getActivityCode(entry.activityCode)?.label ?? "Código não reconhecido"}</h3>
                    <p>{entry.startTime} - {entry.endTime} | {entry.workOrder} | {formatDuration(entry.durationSeconds)}</p>
                    <span className={`status status-${getActivityCode(entry.activityCode)?.group ?? "rejected"}`}>
                      {formatGroup(getActivityCode(entry.activityCode)?.group)}
                    </span>
                    {entry.note ? <small>{entry.note}</small> : null}
                  </div>
                </div>
                <form action={reclassifyDailyReportEntryAction} className="reclassify-form">
                  <input type="hidden" name="reportId" value={report.id} />
                  <input type="hidden" name="entryId" value={entry.id} />
                  <label>
                    Novo código
                    <select name="activityCode" defaultValue={entry.activityCode}>
                      {activityCodes.map((code) => (
                        <option key={code.code} value={code.code}>{code.code} - {code.label}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Justificativa
                    <input name="justification" minLength={8} maxLength={400} placeholder="Ex.: reclassificado por evidência do apontamento" />
                  </label>
                  <button className="secondary-button" type="submit">Reclassificar</button>
                </form>
              </article>
            ))}
          </div>
        </div>

        <aside className="panel">
          <div className="panel-title">
            <h2>Checklist</h2>
            <CircleAlert size={18} />
          </div>
          <div className="validation-checklist">
            <div><span>Funcionário</span><strong>{employee?.fullName ?? "Não encontrado"}</strong></div>
            <div><span>Função</span><strong>{employee ? `${employee.hierarchyLevel} - ${employee.role}` : "Não encontrada"}</strong></div>
            <div><span>Custo</span><strong>{employee?.costType === "direct" ? "Direto" : "Indireto"}</strong></div>
            <div><span>Projeto</span><strong>{study?.name ?? "Não encontrado"}</strong></div>
          </div>
          <div className="validation-alerts">
            {qualityFlags.length > 0 ? qualityFlags.map((flag) => (
              <span className="quality-warning" key={flag}><CircleAlert size={14} /> {flag}</span>
            )) : (
              <span className="quality-ok">Sem alertas automáticos</span>
            )}
          </div>
          <div className="panel-title validation-decision-title">
            <h2>Decisão</h2>
          </div>
          <form action={validateDailyReportAction} className="decision-form">
            <input type="hidden" name="reportId" value={report.id} />
            <label>
              Observação de validação
              <input name="note" maxLength={400} placeholder="Opcional" />
            </label>
            <button className="primary-button" type="submit">
              <CheckCheck size={18} />
              Validar diário
            </button>
          </form>
          <form action={rejectDailyReportAction} className="decision-form danger-zone">
            <input type="hidden" name="reportId" value={report.id} />
            <label>
              Motivo da rejeição
              <input name="note" required minLength={8} maxLength={400} placeholder="Explique o ajuste necessário" />
            </label>
            <button className="secondary-button" type="submit">
              <XCircle size={18} />
              Rejeitar e devolver
            </button>
          </form>
        </aside>
      </section>
    </div>
  );
}

function MetricLike({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </article>
  );
}

function getQualityFlags(entries: typeof import("@/features/pmt/repositories/mock-data").dailyReportEntries) {
  const flags: string[] = [];
  const totalSeconds = entries.reduce((sum, entry) => sum + entry.durationSeconds, 0);

  if (entries.length === 0) flags.push("Sem atividades");
  if (entries.some((entry) => !getActivityCode(entry.activityCode))) flags.push("Código inválido");
  if (entries.some((entry) => !entry.workOrder)) flags.push("OS ausente");
  if (totalSeconds > 12 * 60 * 60) flags.push("Tempo acima de 12h");
  if (totalSeconds < 2 * 60 * 60) flags.push("Tempo abaixo do esperado");

  return flags;
}

function formatGroup(value?: string) {
  const labels: Record<string, string> = {
    productive: "Produtivo",
    indirect: "Indireto",
    loss: "Perda"
  };

  return labels[value ?? ""] ?? "Sem grupo";
}
