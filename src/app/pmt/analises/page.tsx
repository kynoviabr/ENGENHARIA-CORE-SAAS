import { ArrowUpRight, BarChart3, Gauge, ListChecks, Target } from "lucide-react";
import { requirePermission } from "@/core/auth/session";
import { MetricCard } from "@/features/pmt/components/metric-card";
import { formatDuration } from "@/features/pmt/services/calculations";
import { getAnalysisWorkspace } from "@/features/pmt/services/queries";

function groupLabel(group: string) {
  if (group === "productive") return "Produtivo";
  if (group === "indirect") return "Indireto";
  return "Perda";
}

export default async function AnalysisPage() {
  const session = await requirePermission("pmt.analysis.view");
  const analyses = await getAnalysisWorkspace(session.activeTenant.id);
  const current = analyses[0];

  return (
    <div className="page-stack pmt-workflow-page analysis-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Diagnóstico</span>
          <h1>Análises BTT</h1>
        </div>
      </section>

      <section className="metrics-grid">
        <MetricCard label="Projetos analisáveis" value={String(analyses.length)} hint="com base validada" />
        <MetricCard label="FP atual" value={`${current?.result.fpPercent ?? 0}%`} hint="resultado calculado" />
        <MetricCard label="Benchmark" value={`${current?.benchmark.fpPercent ?? 0}%`} hint={current?.benchmark.label ?? "referência"} />
        <MetricCard label="Potencial" value={`${current?.benchmark.potentialGainPercent ?? 0}%`} hint="ganho estimado inicial" />
      </section>

      <section className="analysis-list">
        {analyses.map((analysis) => (
          <article className="panel analysis-card" key={analysis.study.id}>
            <div className="panel-title">
              <div>
                <h2>{analysis.study.name}</h2>
                <span>{analysis.study.client} / {analysis.study.plant} / snapshot {analysis.result.snapshotHash}</span>
              </div>
              <span className={analysis.benchmark.gapPercent >= 0 ? "quality-ok" : "quality-warning"}>
                {analysis.benchmark.gapPercent >= 0 ? "+" : ""}{analysis.benchmark.gapPercent}% vs benchmark
              </span>
            </div>

            <section className="analysis-executive">
              <div>
                <span>Diagnóstico executivo</span>
                <strong>{analysis.diagnosis}</strong>
              </div>
              <div>
                <span>Perdas totais</span>
                <strong>{analysis.lossPercent}% da base validada</strong>
              </div>
              <div>
                <span>Próxima decisão</span>
                <strong>{analysis.recommendations.length > 0 ? "Propor plano de ação priorizado" : "Publicar relatório sem perdas críticas"}</strong>
              </div>
            </section>

            <div className="analysis-grid">
              <div className="analysis-block">
                <div className="panel-title">
                  <h3>Distribuição por código</h3>
                  <BarChart3 size={18} />
                </div>
                <div className="bar-list">
                  {analysis.distribution.map((item) => (
                    <div key={item.code} className="bar-row">
                      <div>
                        <strong>{item.code} - {item.label}</strong>
                        <small>{groupLabel(item.group)} / {formatDuration(item.seconds)}</small>
                      </div>
                      <div className="bar-track" aria-label={`${item.percent}%`}>
                        <span style={{ width: `${Math.min(100, item.percent)}%` }} />
                      </div>
                      <b>{item.percent}%</b>
                    </div>
                  ))}
                </div>
              </div>

              <div className="analysis-block">
                <div className="panel-title">
                  <h3>Indicadores</h3>
                  <Gauge size={18} />
                </div>
                <div className="settings-list">
                  <div><span>Produtivo</span><strong>{formatDuration(analysis.groupTotals.productive)}</strong></div>
                  <div><span>Indireto</span><strong>{formatDuration(analysis.groupTotals.indirect)}</strong></div>
                  <div><span>Perdas</span><strong>{formatDuration(analysis.groupTotals.loss)}</strong></div>
                  <div><span>Cobertura</span><strong>{analysis.result.coveragePercent}%</strong></div>
                </div>
              </div>
            </div>

            <div className="analysis-block">
              <div className="panel-title">
                <h3>Pareto de priorização</h3>
                <ListChecks size={18} />
              </div>
              <div className="pareto-grid">
                {analysis.pareto.slice(0, 5).map((item) => (
                  <article key={item.code} className={`pareto-item pareto-${item.priority}`}>
                    <span>{item.code}</span>
                    <strong>{item.label}</strong>
                    <small>{groupLabel(item.group)} | {item.percent}% individual | {item.cumulativePercent}% acumulado</small>
                  </article>
                ))}
              </div>
            </div>

            <div className="analysis-grid">
              <div className="analysis-block">
                <div className="panel-title">
                  <h3>Benchmarking</h3>
                  <ArrowUpRight size={18} />
                </div>
                <div className="benchmark-card">
                  <span>{analysis.benchmark.label}</span>
                  <strong>{analysis.result.fpPercent}% BTT / {analysis.benchmark.fpPercent}% ref.</strong>
                  <p>Diferença inicial de {analysis.benchmark.gapPercent}% com potencial estimado de {analysis.benchmark.potentialGainPercent}% após atacar perdas priorizadas.</p>
                </div>
              </div>

              <div className="analysis-block">
                <div className="panel-title">
                  <h3>Recomendações iniciais</h3>
                  <Target size={18} />
                </div>
                <div className="recommendation-list">
                  {analysis.recommendations.length > 0 ? analysis.recommendations.map((item) => (
                    <div key={item.title}>
                      <strong>{item.title}</strong>
                      <span>Impacto potencial +{item.impact}%</span>
                      <small>{item.basis}</small>
                    </div>
                  )) : (
                    <p>Nenhuma perda relevante identificada na base validada.</p>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
        {analyses.length === 0 ? (
          <section className="panel empty-panel">Nenhum cálculo publicado para análise.</section>
        ) : null}
      </section>
    </div>
  );
}
