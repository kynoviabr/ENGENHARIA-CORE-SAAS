import { Calculator, FileCheck2, LockKeyhole, Sigma, Send } from "lucide-react";
import { requirePermission } from "@/core/auth/session";
import { runCalculationAction } from "@/features/pmt/actions/calculation-actions";
import { MetricCard } from "@/features/pmt/components/metric-card";
import { StatusBadge } from "@/features/pmt/components/status-badge";
import { formatDuration } from "@/features/pmt/services/calculations";
import { getCalculationWorkspace } from "@/features/pmt/services/queries";

export default async function CalculationsPage() {
  const session = await requirePermission("pmt.calculations.run");
  const workspaces = await getCalculationWorkspace(session.activeTenant.id);
  const ready = workspaces.filter((workspace) => workspace.canCalculate);
  const latest = ready[0];

  return (
    <div className="page-stack pmt-workflow-page calculations-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Processamento</span>
          <h1>Cálculos BTT</h1>
        </div>
      </section>

      <section className="metrics-grid">
        <MetricCard label="Bases prontas" value={String(ready.length)} hint="projetos com diários validados" />
        <MetricCard label="A previsto" value={`${latest?.result.aPercent ?? 0}%`} hint="base validada atual" />
        <MetricCard label="FP previsto" value={`${latest?.result.fpPercent ?? 0}%`} hint="fórmula versionada" />
        <MetricCard label="Snapshot" value={latest?.result.snapshotHash ?? "-"} hint="base congelada" />
      </section>

      <section className="calculation-list">
        {workspaces.map((workspace) => (
          <article className="panel calculation-card" key={workspace.study.id}>
            <div className="panel-title">
              <div>
                <h2>{workspace.study.name}</h2>
                <span>{workspace.study.client} / {workspace.study.plant}</span>
              </div>
              {workspace.latestRun ? <StatusBadge value={workspace.latestRun.status} /> : <span className="quality-warning">Sem cálculo</span>}
            </div>

            <div className="calculation-grid">
              <div><span>Diários validados</span><strong>{workspace.validatedReports.length}</strong></div>
              <div><span>Itens válidos</span><strong>{workspace.entries.length}</strong></div>
              <div><span>Tempo total</span><strong>{formatDuration(workspace.result.totalSeconds)}</strong></div>
              <div><span>Tempo produtivo</span><strong>{formatDuration(workspace.result.productiveSeconds)}</strong></div>
              <div><span>A</span><strong>{workspace.result.aPercent}%</strong></div>
              <div><span>T</span><strong>{workspace.result.travelPercent}%</strong></div>
              <div><span>X</span><strong>{workspace.result.fatiguePercent}%</strong></div>
              <div><span>FP</span><strong>{workspace.result.fpPercent}%</strong></div>
            </div>

            <section className="calculation-workpaper" aria-label={`Memória de cálculo de ${workspace.study.name}`}>
              <div className="panel-title">
                <h3>Memória de cálculo</h3>
                <Sigma size={18} />
              </div>
              <div className="formula-strip">
                <div><span>A</span><strong>{workspace.result.aPercent}%</strong><small>tempo produtivo / tempo total</small></div>
                <div><span>+</span><strong>0,075 × A</strong><small>acréscimo metodológico</small></div>
                <div><span>+</span><strong>T {workspace.result.travelPercent}%</strong><small>deslocamento observado</small></div>
                <div><span>×</span><strong>1 + X {workspace.result.fatiguePercent}%</strong><small>fator de fadiga</small></div>
                <div><span>=</span><strong>FP {workspace.result.fpPercent}%</strong><small>fator de produtividade</small></div>
              </div>
            </section>

            <div className="settings-list calculation-meta">
              <div><span>Algoritmo</span><strong>{workspace.result.algorithmVersion}</strong></div>
              <div><span>Metodologia</span><strong>{workspace.study.methodologyVersion}</strong></div>
              <div><span>Benchmark</span><strong>{workspace.study.benchmarkSegment}</strong></div>
              <div><span>Cobertura</span><strong>{workspace.result.coveragePercent}% de {workspace.study.targetCoverage}% alvo</strong></div>
              <div><span>Snapshot</span><strong>{workspace.result.snapshotHash}</strong></div>
            </div>

            <form action={runCalculationAction} className="button-row calculation-actions">
              <input type="hidden" name="studyId" value={workspace.study.id} />
              <button className="secondary-button" name="intent" value="draft" type="submit" disabled={!workspace.canCalculate}>
                <Calculator size={18} />
                Rodar cálculo
              </button>
              <button className="secondary-button" name="intent" value="approve" type="submit" disabled={!workspace.canCalculate}>
                <FileCheck2 size={18} />
                Aprovar resultado
              </button>
              <button className="primary-button" name="intent" value="publish" type="submit" disabled={!workspace.canCalculate}>
                <Send size={18} />
                Publicar
              </button>
            </form>

            {!workspace.canCalculate ? (
              <p className="empty-note"><LockKeyhole size={16} /> Valide pelo menos um diário com itens antes de calcular.</p>
            ) : null}
          </article>
        ))}
        {workspaces.length === 0 ? (
          <section className="panel empty-panel">Nenhum projeto disponível para cálculo.</section>
        ) : null}
      </section>
    </div>
  );
}
