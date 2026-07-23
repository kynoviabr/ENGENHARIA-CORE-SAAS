import Link from "next/link";
import { Download, FileUp, UploadCloud } from "lucide-react";
import { requirePermission } from "@/core/auth/session";

export default async function ImportDailyReportsPage() {
  await requirePermission("pmt.daily_reports.create");

  return (
    <div className="page-stack narrow">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Upload de planilha</span>
          <h1>Importar diários de rotinas e horas</h1>
        </div>
      </section>

      <section className="panel import-workflow-panel">
        <div className="panel-title">
          <h2>Carga de apontamentos</h2>
          <UploadCloud size={18} />
        </div>

        <div className="settings-list">
          <div><span>Entrada</span><strong>Planilha preenchida pela empresa ou pela equipe Braidotti</strong></div>
          <div><span>Status inicial</span><strong>Recebido, aguardando validação</strong></div>
          <div><span>Validação</span><strong>Normalização, aprovação ou reprovação na aba Validação</strong></div>
        </div>

        <form className="form-grid">
          <label className="full-field">
            Arquivo
            <input type="file" name="file" accept=".xlsx,.xls,.csv" />
          </label>
          <div className="button-row full-field">
            <Link className="secondary-button" href="/templates/btt-diarios-template.csv" download>
              <Download size={18} />
              Baixar template
            </Link>
            <button className="primary-button" type="button">
              <FileUp size={18} />
              Importar planilha
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
