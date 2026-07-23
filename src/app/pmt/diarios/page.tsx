import Link from "next/link";
import { Download, FileUp, Keyboard } from "lucide-react";
import { requirePermission } from "@/core/auth/session";
import { listDailyReports } from "@/features/pmt/services/queries";
import { DailyReportsWorkspace } from "./daily-reports-workspace";

export default async function DailyReportsPage() {
  const session = await requirePermission("pmt.daily_reports.view");
  const reports = await listDailyReports(session.activeTenant.id);

  return (
    <div className="page-stack daily-reports-page">
      <section className="page-heading">
        <div>
          <h1>Diários de Rotinas e Horas</h1>
        </div>
      </section>

      <section className="daily-input-options" aria-label="Formas de entrada dos diários">
        <Link href="/templates/btt-diarios-template.csv" download>
          <Download size={18} />
          <span>Baixar template CSV</span>
          <strong>Modelo para carga de apontamentos</strong>
        </Link>
        <Link href="/pmt/diarios/importar">
          <FileUp size={18} />
          <span>Importar planilha</span>
          <strong>Carregar apontamentos preenchidos em modelo externo</strong>
        </Link>
        <Link href="/pmt/diarios/novo">
          <Keyboard size={18} />
          <span>Digitação manual</span>
          <strong>Registrar apontamento diretamente no sistema</strong>
        </Link>
      </section>

      <DailyReportsWorkspace reports={reports} />
    </div>
  );
}
