import Link from "next/link";
import { Download, FileUp, Mail, Plus } from "lucide-react";
import { requirePermission } from "@/core/auth/session";
import { sendEmployeeInvitesAction } from "@/features/pmt/actions/employee-actions";
import { getEmployeeInputsSummary } from "@/features/pmt/services/queries";
import { EmployeeRegistryWorkspace } from "./employee-registry-workspace";

export default async function EmployeesPage() {
  const session = await requirePermission("pmt.employees.view");
  const summary = await getEmployeeInputsSummary(session.activeTenant.id);

  return (
    <div className="page-stack employees-page">
      <section className="page-heading">
        <div>
          <h1>Cadastro de Funcionários</h1>
        </div>
        <div className="button-row employee-actions-row">
          <Link className="secondary-button" href="/templates/btt-funcionarios-template.csv" download>
            <Download size={18} />
            Baixar template CSV
          </Link>
          <Link className="secondary-button" href="/pmt/funcionarios/importar">
            <FileUp size={18} />
            Importar planilha
          </Link>
          <form action={sendEmployeeInvitesAction}>
            <button className="secondary-button" type="submit">
              <Mail size={18} />
              Enviar convites
            </button>
          </form>
          <Link className="secondary-button" href="/pmt/funcionarios/exportar" download>
            <Download size={18} />
            Baixar cadastro
          </Link>
          <Link className="primary-button" href="/pmt/funcionarios/novo">
            <Plus size={18} />
            Novo funcionário
          </Link>
        </div>
      </section>

      <EmployeeRegistryWorkspace employees={summary.employees} options={summary.options} />
    </div>
  );
}
