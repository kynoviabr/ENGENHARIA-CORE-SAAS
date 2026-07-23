import { requirePermission } from "@/core/auth/session";
import { MetricCard } from "@/features/pmt/components/metric-card";
import { getValidationQueue } from "@/features/pmt/services/queries";
import { ValidationQueueWorkspace } from "./validation-queue-workspace";

export default async function ValidationQueuePage() {
  const session = await requirePermission("pmt.daily_reports.validate");
  const queue = await getValidationQueue(session.activeTenant.id);

  return (
    <div className="page-stack pmt-workflow-page validation-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Qualidade da coleta</span>
          <h1>Validação dos diários</h1>
        </div>
      </section>

      <section className="metrics-grid">
        <MetricCard label="Recebidos" value={String(queue.queue.length)} hint="aguardando validação" />
        <MetricCard label="Selecionáveis" value={String(queue.submittedCount)} hint="disponíveis para decisão" />
        <MetricCard label="Com alerta" value={String(queue.flaggedCount)} hint="qualidade dos dados" />
        <MetricCard label="Reprovados" value={String(queue.rejectedCount)} hint="histórico de devolução" />
      </section>

      <ValidationQueueWorkspace items={queue.queue} />
    </div>
  );
}
