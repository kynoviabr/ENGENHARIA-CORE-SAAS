import Link from "next/link";
import { Download, FileUp } from "lucide-react";
import { requirePermission } from "@/core/auth/session";
import { importEmployeesAction } from "@/features/pmt/actions/employee-actions";

export default async function ImportEmployeesPage() {
  await requirePermission("pmt.employees.import");

  return (
    <div className="page-stack narrow">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Importação em lote</span>
          <h1>Importar funcionários</h1>
          <p>Baixe o template, preencha funcionários, níveis hierárquicos L1-L6 e custos diretos/indiretos das funções. A mesma estrutura pode evoluir para XLSX quando a integração estiver pronta.</p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">
          <h2>Template de cadastro</h2>
          <Link className="secondary-button" href="/templates/btt-funcionarios-template.csv" download>
            <Download size={18} />
            Baixar CSV
          </Link>
        </div>
        <div className="settings-list">
          <div><span>Campos obrigatórios</span><strong>código, nome, e-mail, unidade, área, equipe, turno, disciplina, função, nível, custo</strong></div>
          <div><span>Hierarquia</span><strong>L1 Diretor, L2 Gerente, L3 Supervisor, L4 Mecânico, L5 Eletricista, L6 Ajudante</strong></div>
          <div><span>Custo</span><strong>direct ou indirect, com custo horário em R$</strong></div>
          <div><span>Próxima fase</span><strong>validação de duplicidade, preview e erros por linha</strong></div>
        </div>
      </section>

      <form action={importEmployeesAction} className="panel form-grid">
        <label>
          Arquivo CSV
          <input name="file" required type="file" accept=".csv,text/csv" />
        </label>
        <button className="primary-button" type="submit">
          <FileUp size={18} />
          Enviar importação
        </button>
      </form>
    </div>
  );
}
