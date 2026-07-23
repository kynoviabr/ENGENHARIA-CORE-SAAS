import { FileText, UploadCloud } from "lucide-react";
import { requirePermission } from "@/core/auth/session";

const documentTypes = ["Foto", "Ata", "Escopo", "Modelo", "Material de apoio", "Evidências"];

const projectDocuments = [
  {
    name: "Escopo inicial BTT",
    date: "2026-07-18",
    type: "Escopo",
    fileType: "PDF"
  },
  {
    name: "Modelo de coleta diária",
    date: "2026-07-18",
    type: "Modelo",
    fileType: "CSV"
  }
];

export default async function ProjectDocumentsPage() {
  await requirePermission("pmt.settings.manage");

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <h1>Documentos do Projeto</h1>
          <p>Área reservada para documentos específicos de cada projeto BTT, como escopo, anexos, evidências, modelos de coleta, atas e materiais de apoio.</p>
        </div>
      </section>

      <section className="panel project-document-upload">
        <div className="panel-title">
          <h2>Upload de documentos</h2>
          <UploadCloud size={18} />
        </div>

        <form className="form-grid">
          <label>
            Nome
            <input name="documentName" required maxLength={120} placeholder="Nome do documento" />
          </label>
          <label>
            Date stamp
            <input name="documentDate" required type="date" defaultValue="2026-07-18" />
          </label>
          <label>
            Tipo
            <select name="documentType" required defaultValue="Escopo">
              {documentTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>
          <label>
            Arquivo
            <input name="file" required type="file" accept=".csv,.pdf,.jpg,.jpeg,text/csv,application/pdf,image/jpeg" />
          </label>
          <div className="button-row full-field">
            <button className="primary-button" type="button">
              <UploadCloud size={18} />
              Upload
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel-title">
          <h2>Documentos vinculados</h2>
          <FileText size={18} />
        </div>
        <div className="table-wrap">
          <table className="compact-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Date stamp</th>
                <th>Tipo</th>
                <th>Formato</th>
              </tr>
            </thead>
            <tbody>
              {projectDocuments.map((document) => (
                <tr key={`${document.name}-${document.date}`}>
                  <td><strong>{document.name}</strong></td>
                  <td>{new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${document.date}T00:00:00Z`))}</td>
                  <td>{document.type}</td>
                  <td>{document.fileType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
