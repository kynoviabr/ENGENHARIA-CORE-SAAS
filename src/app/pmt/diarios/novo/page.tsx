import { Save, Send } from "lucide-react";
import { requirePermission } from "@/core/auth/session";
import { createDailyReportAction } from "@/features/pmt/actions/daily-report-actions";
import { activityCodes } from "@/features/pmt/services/activity-codes";
import { getDailyReportFormOptions } from "@/features/pmt/services/queries";
import { DailyReportEntryFields } from "./daily-report-entry-fields";
import { DailyReportHeaderFields } from "./daily-report-header-fields";

export default async function NewDailyReportPage() {
  const session = await requirePermission("pmt.daily_reports.create");
  const options = await getDailyReportFormOptions(session.activeTenant.id);

  return (
    <div className="page-stack collection-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Formulário digital</span>
          <h1>Novo diário de horas</h1>
          <p>Preencha as atividades do turno em sequência. Este diário substitui o papel e vira a base oficial de validação, cálculo e análise do BTT.</p>
        </div>
      </section>

      <form action={createDailyReportAction} className="panel daily-form">
        <div className="form-grid">
          <DailyReportHeaderFields studies={options.studies} employees={options.employees} shiftsByStudy={options.shiftsByStudy} />
        </div>

        <div className="daily-layout daily-layout-single">
          <div className="entry-stack">
            <div className="panel-title daily-title">
              <h2>Atividades do turno</h2>
            </div>

            <DailyReportEntryFields activityCodes={activityCodes} />
          </div>
        </div>

        <div className="button-row sticky-actions">
          <button className="secondary-button" name="intent" value="draft" type="submit">
            <Save size={18} />
            Salvar rascunho
          </button>
          <button className="primary-button" name="intent" value="submit" type="submit">
            <Send size={18} />
            Enviar para validação
          </button>
        </div>
      </form>
    </div>
  );
}
