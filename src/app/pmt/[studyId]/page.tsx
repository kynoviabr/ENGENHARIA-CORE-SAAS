import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, FileDown, RotateCcw } from "lucide-react";
import { getActivityCode } from "@/features/pmt/services/activity-codes";
import { formatDuration } from "@/features/pmt/services/calculations";
import { MetricCard } from "@/features/pmt/components/metric-card";
import { requirePmtProjectAccess } from "@/features/pmt/services/project-access";
import { StatusBadge } from "@/features/pmt/components/status-badge";
import { getStudyWorkspace } from "@/features/pmt/services/queries";

export default async function StudyDetailPage({ params }: { params: Promise<{ studyId: string }> }) {
  const { studyId } = await params;
  const { session, membership } = await requirePmtProjectAccess(studyId, "pmt.projects.view");
  const workspace = await getStudyWorkspace(session.activeTenant.id, studyId);

  if (!workspace) notFound();

  const { study, result, observations, actions } = workspace;

  return (
    <div className="page-stack">
      <section className="page-heading compact">
        <div>
          <span className="eyebrow">{study.client} / {study.plant}</span>
          <h1>{study.name}</h1>
          <p>{study.area} | {study.periodStart} a {study.periodEnd} | snapshot {result.snapshotHash}</p>
        </div>
        <div className="button-row">
          <button className="secondary-button" type="button"><RotateCcw size={17} /> Recalcular</button>
          <button className="primary-button" type="button"><FileDown size={17} /> Publicar</button>
        </div>
      </section>

      <section className="metrics-grid">
        <MetricCard label="Tempo aprovado" value={formatDuration(result.totalSeconds)} hint="base congelável para cálculo" />
        <MetricCard label="A" value={`${result.aPercent}%`} hint="produtividade média" />
        <MetricCard label="T" value={`${result.travelPercent}%`} hint="deslocamento observado" />
        <MetricCard label="FP" value={`${result.fpPercent}%`} hint={`${result.algorithmVersion} / X ${result.fatiguePercent}%`} />
      </section>

      <section className="content-grid">
        <div className="panel wide">
          <div className="panel-title">
            <h2>Observações de campo</h2>
            <span>{observations.length} registros</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Colaborador</th>
                  <th>Contexto</th>
                  <th>Código</th>
                  <th>Duração</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {observations.map((row) => (
                  <tr key={row.id}>
                    <td>{new Date(row.observedAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</td>
                    <td>
                      <strong>{row.collaboratorCode}</strong>
                      <small>{row.team} / {row.shift}</small>
                    </td>
                    <td>
                      <strong>{row.discipline}</strong>
                      <small>{row.workOrder}</small>
                    </td>
                    <td>
                      <span className="code-pill">{row.activityCode}</span>
                      <small>{getActivityCode(row.activityCode)?.label}</small>
                    </td>
                    <td>{formatDuration(row.durationSeconds)}</td>
                    <td><StatusBadge value={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">
            <h2>Plano de ação</h2>
            <CheckCircle2 size={18} />
          </div>
          <div className="action-list">
            {actions.map((action) => (
              <article key={action.id}>
                <StatusBadge value={action.status} />
                <h3>{action.title}</h3>
                <p>{action.owner} até {action.dueDate}</p>
                <strong>+{action.estimatedBenefitPercent}% estimado</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">
          <h2>Governança do resultado</h2>
          <Clock size={18} />
        </div>
        <div className="governance-grid">
          <div><span>Metodologia</span><strong>{study.methodologyVersion}</strong></div>
          <div><span>Benchmark</span><strong>{study.benchmarkSegment}</strong></div>
          <div><span>Coleta</span><strong>{formatCollectionMode(study.collectionMode)}</strong></div>
          <div><span>Catálogos</span><strong>{study.activityCatalogVersion}</strong></div>
          <div><span>Organograma</span><strong>{study.hierarchyCatalogVersion}</strong></div>
          <div><span>Cargos-base</span><strong>{study.roleCatalogVersion}</strong></div>
          <div><span>Hash do snapshot</span><strong>{result.snapshotHash}</strong></div>
          <div><span>Algoritmo</span><strong>{result.algorithmVersion}</strong></div>
          <div><span>Status</span><StatusBadge value={study.status} /></div>
          <div><span>Papel no tenant</span><strong>{session.roles.join(" / ")}</strong></div>
          <div><span>Acesso no projeto</span><strong>{membership?.roleCode ?? "Permissão administrativa"}</strong></div>
        </div>
      </section>

      <Link href="/pmt/projetos" className="text-link">Voltar para projetos</Link>
    </div>
  );
}

function formatCollectionMode(value: string) {
  const labels: Record<string, string> = {
    self_report: "Funcionário",
    observer: "Observador",
    hybrid: "Híbrido"
  };

  return labels[value] ?? value;
}
