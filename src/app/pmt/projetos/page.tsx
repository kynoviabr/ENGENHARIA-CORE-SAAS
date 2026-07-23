import Link from "next/link";
import { ArrowRight, CircleAlert, Plus, UsersRound } from "lucide-react";
import { requirePermission } from "@/core/auth/session";
import { MetricCard } from "@/features/pmt/components/metric-card";
import { StatusBadge } from "@/features/pmt/components/status-badge";
import { formatDuration } from "@/features/pmt/services/calculations";
import { getDashboard } from "@/features/pmt/services/queries";

export default async function PmtDashboardPage() {
  const session = await requirePermission("pmt.dashboard.view");
  const dashboard = await getDashboard(session.activeTenant.id);
  const latest = dashboard.workspaces[0];

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Produtividade da Manutenção</span>
          <h1>Projetos BTT</h1>
          <p>Planeje coletas, valide observações, congele snapshots e acompanhe perdas com rastreabilidade por tenant.</p>
        </div>
        <Link className="primary-button" href="/pmt/novo">
          <Plus size={18} />
          Novo projeto
        </Link>
      </section>

      <section className="metrics-grid">
        <MetricCard label="Projetos ativos" value={String(dashboard.studies.length)} hint="escopo operacional no BTT" />
        <MetricCard label="A médio" value={`${latest?.result.aPercent ?? 0}%`} hint="produtividade média aprovada" />
        <MetricCard label="FP atual" value={`${latest?.result.fpPercent ?? 0}%`} hint="fórmula Braidotti versionada" />
        <MetricCard label="Funcionários" value={String(dashboard.activeEmployees)} hint="preenchem ou são medidos" />
      </section>

      <section className="content-grid">
        <div className="panel wide">
          <div className="panel-title">
            <h2>Carteira de projetos</h2>
            <span>{dashboard.openActions} ações abertas</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Projeto</th>
                  <th>Planta</th>
                  <th>Status</th>
                  <th>A</th>
                  <th>FP</th>
                  <th>Cobertura</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {dashboard.workspaces.map(({ study, result }) => (
                  <tr key={study.id}>
                    <td>
                      <strong>{study.name}</strong>
                      <small>{study.client} / {study.area}</small>
                    </td>
                    <td>{study.plant}</td>
                    <td><StatusBadge value={study.status} /></td>
                    <td>{result.aPercent}%</td>
                    <td>{result.fpPercent}%</td>
                    <td>{result.coveragePercent}%</td>
                    <td>
                      <Link className="icon-link" href={`/pmt/${study.id}`} aria-label={`Abrir ${study.name}`} title={`Abrir ${study.name}`}>
                        <ArrowRight size={17} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">
            <h2>Inputs diários</h2>
            <UsersRound size={18} />
          </div>
          <div className="loss-list input-summary">
            <div>
              <span>Rascunhos em campo</span>
              <strong>{dashboard.draftDailyReports}</strong>
            </div>
            <div>
              <span>Relatórios enviados</span>
              <strong>{dashboard.submittedDailyReports}</strong>
            </div>
            <div>
              <span>Observações pendentes</span>
              <strong>{dashboard.pendingObservations}</strong>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">
            <h2>Principais perdas</h2>
            <CircleAlert size={18} />
          </div>
          <div className="loss-list">
            {dashboard.pareto.map((item) => (
              <div key={item.code}>
                <span>{item.label}</span>
                <strong>{formatDuration(item.seconds)}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
