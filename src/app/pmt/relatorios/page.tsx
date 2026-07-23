import Link from "next/link";
import { BarChart3, ClipboardCheck, FileSpreadsheet, FileText, UploadCloud } from "lucide-react";
import { requirePermission } from "@/core/auth/session";
import { StatusBadge } from "@/features/pmt/components/status-badge";
import { formatDuration } from "@/features/pmt/services/calculations";
import { getAnalysisWorkspace, getDashboard } from "@/features/pmt/services/queries";

export default async function ReportsPage() {
  const session = await requirePermission("pmt.reports.view");
  const dashboard = await getDashboard(session.activeTenant.id);
  const analyses = await getAnalysisWorkspace(session.activeTenant.id);

  return (
    <div className="page-stack pmt-workflow-page reports-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Entregáveis</span>
          <h1>Relatórios e exportações</h1>
        </div>
      </section>

      <section className="delivery-grid">
        <article><FileText size={20} /><span>Relatório técnico</span><strong>Diagnóstico, metodologia e ganhos</strong></article>
        <article><BarChart3 size={20} /><span>Dashboard</span><strong>Indicadores, perdas e benchmark</strong></article>
        <article><ClipboardCheck size={20} /><span>Plano de ação</span><strong>Recomendações, responsáveis e prazos</strong></article>
        <article><UploadCloud size={20} /><span>Exportações</span><strong>PDF, Excel, CSV e API futura</strong></article>
      </section>

      <section className="panel">
        <div className="panel-title">
          <h2>Pacotes disponíveis</h2>
          <span>DOCX/PDF/XLSX/CSV</span>
        </div>
        <div className="report-grid">
          {dashboard.workspaces.map(({ study, result, actions }) => {
            const analysis = analyses.find((item) => item.study.id === study.id);
            const openActions = actions.filter((action) => action.status !== "done");

            return (
            <article key={study.id} className="report-item">
              <div className="report-main">
                <div>
                  <StatusBadge value={study.status} />
                  <h3>{study.name}</h3>
                  <p>{study.client} / {study.plant} / FP {result.fpPercent}% / {study.benchmarkSegment}</p>
                </div>
                <div className="report-summary">
                  <span>Snapshot {result.snapshotHash}</span>
                  <span>{formatDuration(result.totalSeconds)} analisados</span>
                  <span>{openActions.length} ação(ões) em aberto</span>
                  <span>{analysis ? `${analysis.benchmark.gapPercent}% vs benchmark` : "Sem análise calculada"}</span>
                </div>
              </div>
              <div className="button-row">
                <button className="secondary-button" type="button"><FileText size={17} /> Técnico</button>
                <button className="secondary-button" type="button"><FileSpreadsheet size={17} /> Analítico</button>
                <Link className="icon-link" href={`/pmt/${study.id}`} aria-label={`Abrir ${study.name}`}>Abrir</Link>
              </div>
            </article>
          );
          })}
          {dashboard.workspaces.length === 0 ? (
            <span className="empty-table-note">Nenhum pacote disponível.</span>
          ) : null}
        </div>
      </section>

      <section className="content-grid">
        <div className="panel wide">
          <div className="panel-title">
            <h2>Plano de ação proposto</h2>
            <ClipboardCheck size={18} />
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Recomendação</th>
                  <th>Projeto</th>
                  <th>Responsável</th>
                  <th>Prazo</th>
                  <th>Benefício</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.workspaces.flatMap(({ study, actions }) => actions.map((action) => (
                  <tr key={action.id}>
                    <td><strong>{action.title}</strong></td>
                    <td>{study.client}</td>
                    <td>{action.owner}</td>
                    <td>{action.dueDate}</td>
                    <td>+{action.estimatedBenefitPercent}%</td>
                    <td><StatusBadge value={action.status} /></td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="panel">
          <div className="panel-title">
            <h2>Checklist de entrega</h2>
            <FileText size={18} />
          </div>
          <div className="settings-list">
            <div><span>Base</span><strong>Diários validados e snapshot publicado</strong></div>
            <div><span>Método</span><strong>Versão, algoritmo e benchmark explícitos</strong></div>
            <div><span>Diagnóstico</span><strong>Pareto, perdas, desvio e potencial</strong></div>
            <div><span>Ação</span><strong>Proposta, responsável, prazo e ganho</strong></div>
          </div>
        </aside>
      </section>
    </div>
  );
}
