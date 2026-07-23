import { ClipboardPlus } from "lucide-react";
import { requirePermission } from "@/core/auth/session";
import { createStudyAction } from "@/features/pmt/actions/study-actions";
import { benchmarkCatalog, calculationMemoryCatalog, hierarchyCatalog, roleCatalog } from "@/features/pmt/services/system-catalogs";
import { ClientContractFields } from "./client-contract-fields";
import { ConfirmableSectionBody } from "./confirmable-section-body";
import { ProjectContactFields } from "./project-contact-fields";
import { ProjectHierarchyFields } from "./project-hierarchy-fields";
import { ProjectDisciplinesFields, ProjectShiftsFields, ProjectTeamsFields } from "./project-operational-catalog-fields";
import { ProjectRoleFields } from "./project-role-fields";

export default async function NewStudyPage() {
  await requirePermission("pmt.projects.create");

  return (
    <div className="page-stack new-study-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Setup do estudo</span>
          <h1>Cadastro Projeto BTT</h1>
        </div>
      </section>

      <form action={createStudyAction} className="panel new-study-form">
        <input type="hidden" name="targetCoverage" value="85" />

        <details className="collapsible-form-section" name="new-study-sections">
          <summary>
            <span>Dados do Projeto</span>
          </summary>
          <div className="collapsible-form-body">
            <ConfirmableSectionBody>
              <ClientContractFields />
              <div className="form-subsection">
                <span>Contatos do cliente</span>
              </div>
              <ProjectContactFields />
              <div className="form-subsection">
                <span>Escopo operacional</span>
              </div>
              <div className="form-grid">
                <label>
                  Área operacional observada
                  <input name="operationalArea" maxLength={80} placeholder="Linha, setor, oficina ou processo" />
                </label>
                <div className="two-field-row full-field">
                  <label>
                    Dias planejados de coleta
                    <input name="plannedCollectionDays" type="number" min="1" max="120" placeholder="Ex.: 10" />
                  </label>
                  <label>
                    Funcionários estimados na amostra
                    <input name="plannedEmployeeSample" type="number" min="1" max="5000" placeholder="Ex.: 45" />
                  </label>
                </div>
                <label>
                  Modo de coleta
                  <select name="collectionMode" required defaultValue="hybrid">
                    <option value="hybrid">Híbrido: funcionário e observador</option>
                    <option value="self_report">Funcionário preenche o próprio diário</option>
                    <option value="observer">Observador ou gestor registra em campo</option>
                  </select>
                </label>
                <label>
                  Custeio das funções
                  <select name="costingMode" defaultValue="direct_indirect">
                    <option value="direct_indirect">Separar custo direto e indireto</option>
                    <option value="direct_only">Considerar apenas custo direto</option>
                    <option value="later">Configurar depois</option>
                  </select>
                </label>
              </div>
            </ConfirmableSectionBody>
          </div>
        </details>

        <details className="collapsible-form-section" name="new-study-sections">
          <summary>
            <span>Cadastro de equipes</span>
          </summary>
          <div className="collapsible-form-body">
            <ProjectTeamsFields />
          </div>
        </details>

        <details className="collapsible-form-section" name="new-study-sections">
          <summary>
            <span>Cadastro de turnos</span>
          </summary>
          <div className="collapsible-form-body">
            <ProjectShiftsFields />
          </div>
        </details>

        <details className="collapsible-form-section" name="new-study-sections">
          <summary>
            <span>Cadastro de disciplinas</span>
          </summary>
          <div className="collapsible-form-body">
            <ProjectDisciplinesFields />
          </div>
        </details>

        <details className="collapsible-form-section" name="new-study-sections">
          <summary>
            <span>Organograma do projeto</span>
          </summary>
          <div className="collapsible-form-body">
            <ProjectHierarchyFields levels={hierarchyCatalog} />
          </div>
        </details>

        <details className="collapsible-form-section" name="new-study-sections">
          <summary>
            <span>Cargos e funções do projeto</span>
          </summary>
          <div className="collapsible-form-body">
            <ProjectRoleFields roles={roleCatalog} />
          </div>
        </details>

        <details className="collapsible-form-section" name="new-study-sections">
          <summary>
            <span>Benchmark de referência</span>
          </summary>
          <div className="collapsible-form-body">
            <ConfirmableSectionBody>
              <div className="form-grid">
                <label>
                  Benchmark de referência
                  <select name="benchmarkSegment" required defaultValue={benchmarkCatalog[0].segment}>
                    {benchmarkCatalog.map((benchmark) => (
                      <option key={benchmark.segment} value={benchmark.segment}>
                        {benchmark.segment} - FP {benchmark.referenceFpPercent}%
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </ConfirmableSectionBody>
          </div>
        </details>

        <details className="collapsible-form-section" name="new-study-sections">
          <summary>
            <span>Memória de cálculo</span>
          </summary>
          <div className="collapsible-form-body">
            <ConfirmableSectionBody>
              <div className="formula-reference-list">
                {calculationMemoryCatalog.map((item) => (
                  <div key={item.key}>
                    <span>{item.key}</span>
                    <strong>{item.label}</strong>
                    <code>{item.formula}</code>
                    <small>{item.description}</small>
                  </div>
                ))}
              </div>
            </ConfirmableSectionBody>
          </div>
        </details>

        <div className="form-actions">
          <button className="primary-button" type="submit">
            <ClipboardPlus size={18} />
            Salvar Projeto
          </button>
        </div>
      </form>
    </div>
  );
}
