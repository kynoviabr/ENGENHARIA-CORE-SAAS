"use client";

import { useMemo, useState } from "react";
import { BookOpenCheck, BriefcaseBusiness, Calculator, CheckCircle2, GitBranch, Pencil, Plus, ShieldCheck, TableProperties, Trash2, X } from "lucide-react";
import type { ActivityCode, EmployeeCostType, EmployeeHierarchyLevel } from "@/features/pmt/types";
import type { PmtBenchmarkCatalogItem, PmtCalculationMemoryItem, PmtHierarchyCatalogItem, PmtRoleCatalogItem } from "@/features/pmt/services/system-catalogs";

type CatalogSection = "activities" | "hierarchy" | "roles" | "benchmarks" | "calculations" | "validationRules";

type EditorState = {
  section: CatalogSection;
  index: number | null;
} | null;

const groupLabel = {
  productive: "Produtivo",
  indirect: "Indireto",
  loss: "Perda"
};

const costLabel = {
  direct: "Direto",
  indirect: "Indireto"
};

const sectionTitle = {
  activities: "atividade",
  hierarchy: "nível hierárquico",
  roles: "cargo",
  benchmarks: "benchmark",
  calculations: "fórmula",
  validationRules: "regra de validação"
};

const allCatalogSections: CatalogSection[] = ["activities", "hierarchy", "roles", "benchmarks", "calculations", "validationRules"];

export function SettingsCatalogManager({
  initialActivities,
  initialHierarchy,
  initialRoles,
  initialBenchmarks,
  initialCalculations
}: {
  initialActivities: ActivityCode[];
  initialHierarchy: PmtHierarchyCatalogItem[];
  initialRoles: PmtRoleCatalogItem[];
  initialBenchmarks: PmtBenchmarkCatalogItem[];
  initialCalculations: PmtCalculationMemoryItem[];
}) {
  const [activities, setActivities] = useState(initialActivities);
  const [hierarchy, setHierarchy] = useState(initialHierarchy);
  const [roles, setRoles] = useState(initialRoles);
  const [benchmarks, setBenchmarks] = useState(initialBenchmarks);
  const [calculations, setCalculations] = useState(initialCalculations);
  const [editor, setEditor] = useState<EditorState>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<CatalogSection>>(() => new Set(allCatalogSections));

  const currentItem = useMemo(() => {
    if (!editor || editor.index === null) return null;
    if (editor.section === "activities") return activities[editor.index];
    if (editor.section === "hierarchy") return hierarchy[editor.index];
    if (editor.section === "roles") return roles[editor.index];
    if (editor.section === "benchmarks") return benchmarks[editor.index];
    if (editor.section === "validationRules") return null;
    return calculations[editor.index];
  }, [activities, benchmarks, calculations, editor, hierarchy, roles]);

  function deleteItem(section: CatalogSection, index: number) {
    if (!window.confirm("Deseja excluir este registro?")) return;

    if (section === "activities") setActivities((items) => items.filter((_, itemIndex) => itemIndex !== index));
    if (section === "hierarchy") setHierarchy((items) => items.filter((_, itemIndex) => itemIndex !== index));
    if (section === "roles") setRoles((items) => items.filter((_, itemIndex) => itemIndex !== index));
    if (section === "benchmarks") setBenchmarks((items) => items.filter((_, itemIndex) => itemIndex !== index));
    if (section === "calculations") setCalculations((items) => items.filter((_, itemIndex) => itemIndex !== index));
  }

  function isCollapsed(section: CatalogSection) {
    return collapsedSections.has(section);
  }

  function toggleSection(section: CatalogSection) {
    setCollapsedSections((current) => {
      const next = new Set(current);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }

  function selectSection(section: CatalogSection, elementId: string) {
    const shouldOpen = collapsedSections.has(section);
    toggleSection(section);

    if (shouldOpen) {
      window.setTimeout(() => {
        document.getElementById(elementId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  }

  function saveItem(formData: FormData) {
    if (!editor) return;

    const index = editor.index;
    const updateList = <T,>(items: T[], item: T) => index === null ? [...items, item] : items.map((current, itemIndex) => itemIndex === index ? item : current);

    if (editor.section === "activities") {
      const item: ActivityCode = {
        code: Number(formData.get("code")),
        label: String(formData.get("label")),
        group: String(formData.get("group")) as ActivityCode["group"],
        description: String(formData.get("description"))
      };
      setActivities((items) => updateList(items, item));
    }

    if (editor.section === "hierarchy") {
      const item: PmtHierarchyCatalogItem = {
        level: String(formData.get("level")) as EmployeeHierarchyLevel,
        label: String(formData.get("label")),
        defaultScope: String(formData.get("defaultScope")),
        canSelfReport: formData.get("canSelfReport") === "true"
      };
      setHierarchy((items) => updateList(items, item));
    }

    if (editor.section === "roles") {
      const item: PmtRoleCatalogItem = {
        name: String(formData.get("name")),
        discipline: String(formData.get("discipline")),
        defaultHierarchyLevel: String(formData.get("defaultHierarchyLevel")) as EmployeeHierarchyLevel,
        defaultCostType: String(formData.get("defaultCostType")) as EmployeeCostType,
        defaultSelfReport: formData.get("defaultSelfReport") === "true"
      };
      setRoles((items) => updateList(items, item));
    }

    if (editor.section === "benchmarks") {
      const item: PmtBenchmarkCatalogItem = {
        segment: String(formData.get("segment")),
        referenceFpPercent: Number(formData.get("referenceFpPercent")),
        methodologyVersion: String(formData.get("methodologyVersion")),
        applicability: String(formData.get("applicability"))
      };
      setBenchmarks((items) => updateList(items, item));
    }

    if (editor.section === "calculations") {
      const item: PmtCalculationMemoryItem = {
        key: String(formData.get("key")),
        label: String(formData.get("label")),
        formula: String(formData.get("formula")),
        description: String(formData.get("description"))
      };
      setCalculations((items) => updateList(items, item));
    }

    setEditor(null);
  }

  return (
    <>
      <nav className="settings-selector" aria-label="Selecionar configuração global">
        <button type="button" onClick={() => selectSection("activities", "catalogo-atividades")} aria-expanded={!isCollapsed("activities")}>
          <TableProperties size={18} />
          <span>Catálogo de atividades</span>
        </button>
        <button type="button" onClick={() => selectSection("hierarchy", "niveis-hierarquicos")} aria-expanded={!isCollapsed("hierarchy")}>
          <GitBranch size={18} />
          <span>Níveis Hierárquicos</span>
        </button>
        <button type="button" onClick={() => selectSection("roles", "cargos-funcoes")} aria-expanded={!isCollapsed("roles")}>
          <BriefcaseBusiness size={18} />
          <span>Cargos e Funções</span>
        </button>
        <button type="button" onClick={() => selectSection("benchmarks", "benchmarks")} aria-expanded={!isCollapsed("benchmarks")}>
          <BookOpenCheck size={18} />
          <span>Benchmarks</span>
        </button>
        <button type="button" onClick={() => selectSection("calculations", "memoria-calculo")} aria-expanded={!isCollapsed("calculations")}>
          <Calculator size={18} />
          <span>Memória de Cálculo</span>
        </button>
        <button type="button" onClick={() => selectSection("validationRules", "regra-validacao")} aria-expanded={!isCollapsed("validationRules")}>
          <ShieldCheck size={18} />
          <span>Regra de Validação</span>
        </button>
      </nav>

      <section className="panel settings-panel settings-section" id="catalogo-atividades">
        <SectionToolbar title="Catálogo de atividades" buttonLabel="Incluir atividade" collapsed={isCollapsed("activities")} onToggle={() => toggleSection("activities")} onAdd={() => setEditor({ section: "activities", index: null })} />
        {!isCollapsed("activities") && <div className="table-wrap">
          <table className="compact-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Atividade</th>
                <th>Grupo</th>
                <th>Descrição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((code, index) => (
                <tr key={`${code.code}-${index}`}>
                  <td><span className="code-pill">{code.code}</span></td>
                  <td><strong>{code.label}</strong></td>
                  <td>{groupLabel[code.group]}</td>
                  <td>{code.description}</td>
                  <td><RowActions onEdit={() => setEditor({ section: "activities", index })} onDelete={() => deleteItem("activities", index)} label={`atividade ${code.code}`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
      </section>

      <section className="panel settings-panel settings-section" id="niveis-hierarquicos">
        <SectionToolbar title="Níveis hierárquicos padrão" buttonLabel="Incluir nível" collapsed={isCollapsed("hierarchy")} onToggle={() => toggleSection("hierarchy")} onAdd={() => setEditor({ section: "hierarchy", index: null })} />
        {!isCollapsed("hierarchy") && <div className="table-wrap">
          <table className="compact-table">
            <thead>
              <tr>
                <th>Nível</th>
                <th>Descrição</th>
                <th>Escopo padrão</th>
                <th>Aponta horas?</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {hierarchy.map((item, index) => (
                <tr key={`${item.level}-${index}`}>
                  <td><span className="code-pill">{item.level}</span></td>
                  <td><strong>{item.label}</strong></td>
                  <td>{item.defaultScope}</td>
                  <td>{item.canSelfReport ? "Sim" : "Não"}</td>
                  <td><RowActions onEdit={() => setEditor({ section: "hierarchy", index })} onDelete={() => deleteItem("hierarchy", index)} label={`nível ${item.level}`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}

      </section>

      <section className="panel settings-panel settings-section" id="cargos-funcoes">
        <SectionToolbar title="Cargos e funções padronizados" buttonLabel="Incluir cargo" collapsed={isCollapsed("roles")} onToggle={() => toggleSection("roles")} onAdd={() => setEditor({ section: "roles", index: null })} />
        {!isCollapsed("roles") && <div className="table-wrap">
          <table className="compact-table">
            <thead>
              <tr>
                <th>Cargo</th>
                <th>Disciplina</th>
                <th>Nível sugerido</th>
                <th>Custo padrão</th>
                <th>Aponta?</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role, index) => (
                <tr key={`${role.name}-${index}`}>
                  <td><strong>{role.name}</strong></td>
                  <td>{role.discipline}</td>
                  <td><span className="code-pill">{role.defaultHierarchyLevel}</span></td>
                  <td>{costLabel[role.defaultCostType]}</td>
                  <td>{role.defaultSelfReport ? "Sim" : "Não"}</td>
                  <td><RowActions onEdit={() => setEditor({ section: "roles", index })} onDelete={() => deleteItem("roles", index)} label={`cargo ${role.name}`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
      </section>

      <section className="panel settings-panel settings-section" id="benchmarks">
        <SectionToolbar title="Benchmarks" buttonLabel="Incluir benchmark" collapsed={isCollapsed("benchmarks")} onToggle={() => toggleSection("benchmarks")} onAdd={() => setEditor({ section: "benchmarks", index: null })} />
        {!isCollapsed("benchmarks") && <div className="table-wrap">
          <table className="compact-table">
            <thead>
              <tr>
                <th>Segmento</th>
                <th>FP referência</th>
                <th>Versão</th>
                <th>Aplicabilidade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.map((benchmark, index) => (
                <tr key={`${benchmark.segment}-${index}`}>
                  <td><strong>{benchmark.segment}</strong></td>
                  <td>{benchmark.referenceFpPercent}%</td>
                  <td>{benchmark.methodologyVersion}</td>
                  <td>{benchmark.applicability}</td>
                  <td><RowActions onEdit={() => setEditor({ section: "benchmarks", index })} onDelete={() => deleteItem("benchmarks", index)} label={`benchmark ${benchmark.segment}`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
      </section>

      <section className="panel settings-panel settings-section" id="memoria-calculo">
        <SectionToolbar title="Memória de cálculo aplicada no sistema" subtitle="fórmulas oficiais" buttonLabel="Incluir fórmula" collapsed={isCollapsed("calculations")} onToggle={() => toggleSection("calculations")} onAdd={() => setEditor({ section: "calculations", index: null })} />
        {!isCollapsed("calculations") && <div className="table-wrap">
          <table className="compact-table">
            <thead>
              <tr>
                <th>Chave</th>
                <th>Indicador</th>
                <th>Fórmula</th>
                <th>Descrição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {calculations.map((item, index) => (
                <tr key={`${item.key}-${index}`}>
                  <td><span className="code-pill">{item.key}</span></td>
                  <td><strong>{item.label}</strong></td>
                  <td>{item.formula}</td>
                  <td>{item.description}</td>
                  <td><RowActions onEdit={() => setEditor({ section: "calculations", index })} onDelete={() => deleteItem("calculations", index)} label={`fórmula ${item.key}`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
      </section>

      <section className="panel settings-panel settings-section" id="regra-validacao">
        <SectionToolbar title="Regra de Validação" subtitle="parâmetros globais de apontamento" collapsed={isCollapsed("validationRules")} onToggle={() => toggleSection("validationRules")} />
        {!isCollapsed("validationRules") && <ValidationRulesFields />}
      </section>

      {editor && (
        <CatalogEditor
          editor={editor}
          item={currentItem}
          onClose={() => setEditor(null)}
          onSave={saveItem}
        />
      )}
    </>
  );
}

function ValidationRulesFields() {
  const [dirty, setDirty] = useState(false);
  const [confirmed, setConfirmed] = useState(true);

  function markDirty() {
    setDirty(true);
    setConfirmed(false);
  }

  function confirmRules() {
    setDirty(false);
    setConfirmed(true);
  }

  return (
    <div className="validation-rules-form" onChange={markDirty} onInput={markDirty}>
      <div className={`section-save-state ${dirty ? "is-dirty" : ""}`}>
        <span>
          <CheckCircle2 size={14} />
          {confirmed ? "Alterações salvas" : "Alterações pendentes"}
        </span>
      </div>

      <div className="settings-rule-grid">
        <label>
          Número de horas diárias apontáveis
          <input name="dailyAssignableHours" inputMode="numeric" pattern="^[0-9]{1,3}:[0-5][0-9]$" defaultValue="08:00" placeholder="08:00" />
        </label>
        <label>
          Número de horas semanais apontáveis
          <input name="weeklyAssignableHours" inputMode="numeric" pattern="^[0-9]{1,3}:[0-5][0-9]$" defaultValue="40:00" placeholder="40:00" />
        </label>
        <label>
          Atividade de complemento quando o número de horas for menor
          <input name="dailyComplementActivityCode" type="number" min="0" step="1" defaultValue={10} />
        </label>
      </div>

      <div className="catalog-inline-actions">
        <button className="secondary-button confirm-section-button" type="button" onClick={confirmRules} disabled={!dirty}>
          Confirmar cadastro
        </button>
      </div>
    </div>
  );
}

function SectionToolbar({ title, subtitle, buttonLabel, collapsed, onToggle, onAdd }: { title: string; subtitle?: string; buttonLabel?: string; collapsed: boolean; onToggle: () => void; onAdd?: () => void }) {
  return (
    <div className={`section-toolbar ${collapsed ? "" : "is-open"}`}>
      <button type="button" className="section-toggle" onClick={onToggle} aria-expanded={!collapsed}>
        <span>
          <strong>{title}</strong>
          {subtitle ? <small>{subtitle}</small> : null}
        </span>
      </button>
      {buttonLabel && onAdd ? (
        <button type="button" className="primary-button compact-button" onClick={onAdd}>
          <Plus size={16} />
          {buttonLabel}
        </button>
      ) : null}
    </div>
  );
}

function RowActions({ label, onEdit, onDelete }: { label: string; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="table-actions">
      <button type="button" className="action-button" aria-label={`Editar ${label}`} onClick={onEdit}>
        <Pencil size={15} />
      </button>
      <button type="button" className="action-button danger" aria-label={`Excluir ${label}`} onClick={onDelete}>
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function CatalogEditor({ editor, item, onClose, onSave }: { editor: Exclude<EditorState, null>; item: unknown; onClose: () => void; onSave: (formData: FormData) => void }) {
  return (
    <div className="catalog-modal-backdrop" role="presentation">
      <form
        className="catalog-modal"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(new FormData(event.currentTarget));
        }}
      >
        <div className="catalog-modal-title">
          <div>
            <span>{editor.index === null ? "Incluir" : "Editar"}</span>
            <h2>{sectionTitle[editor.section]}</h2>
          </div>
          <button type="button" className="action-button" aria-label="Fechar formulário" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <CatalogFields section={editor.section} item={item} />

        <div className="button-row modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
          <button type="submit" className="primary-button">Salvar</button>
        </div>
      </form>
    </div>
  );
}

function CatalogFields({ section, item }: { section: CatalogSection; item: unknown }) {
  if (section === "activities") {
    const value = item as ActivityCode | null;
    return (
      <div className="catalog-form-grid">
        <label>Código<input name="code" type="number" defaultValue={value?.code ?? ""} required /></label>
        <label>Atividade<input name="label" defaultValue={value?.label ?? ""} required /></label>
        <label>Grupo<select name="group" defaultValue={value?.group ?? "productive"}><option value="productive">Produtivo</option><option value="indirect">Indireto</option><option value="loss">Perda</option></select></label>
        <label className="full-field">Descrição<textarea name="description" defaultValue={value?.description ?? ""} required /></label>
      </div>
    );
  }

  if (section === "hierarchy") {
    const value = item as PmtHierarchyCatalogItem | null;
    return (
      <div className="catalog-form-grid">
        <label>Nível<LevelSelect name="level" value={value?.level} /></label>
        <label>Descrição<input name="label" defaultValue={value?.label ?? ""} required /></label>
        <label>Aponta horas?<select name="canSelfReport" defaultValue={String(value?.canSelfReport ?? false)}><option value="false">Não</option><option value="true">Sim</option></select></label>
        <label className="full-field">Escopo padrão<textarea name="defaultScope" defaultValue={value?.defaultScope ?? ""} required /></label>
      </div>
    );
  }

  if (section === "roles") {
    const value = item as PmtRoleCatalogItem | null;
    return (
      <div className="catalog-form-grid">
        <label>Cargo<input name="name" defaultValue={value?.name ?? ""} required /></label>
        <label>Disciplina<input name="discipline" defaultValue={value?.discipline ?? ""} required /></label>
        <label>Nível sugerido<LevelSelect name="defaultHierarchyLevel" value={value?.defaultHierarchyLevel} /></label>
        <label>Custo padrão<select name="defaultCostType" defaultValue={value?.defaultCostType ?? "direct"}><option value="direct">Direto</option><option value="indirect">Indireto</option></select></label>
        <label>Aponta horas?<select name="defaultSelfReport" defaultValue={String(value?.defaultSelfReport ?? true)}><option value="true">Sim</option><option value="false">Não</option></select></label>
      </div>
    );
  }

  if (section === "benchmarks") {
    const value = item as PmtBenchmarkCatalogItem | null;
    return (
      <div className="catalog-form-grid">
        <label>Segmento<input name="segment" defaultValue={value?.segment ?? ""} required /></label>
        <label>FP referência (%)<input name="referenceFpPercent" type="number" defaultValue={value?.referenceFpPercent ?? ""} required /></label>
        <label>Versão<input name="methodologyVersion" defaultValue={value?.methodologyVersion ?? "braidotti-pmt-v2.0"} required /></label>
        <label className="full-field">Aplicabilidade<textarea name="applicability" defaultValue={value?.applicability ?? ""} required /></label>
      </div>
    );
  }

  const value = item as PmtCalculationMemoryItem | null;
  return (
    <div className="catalog-form-grid">
      <label>Chave<input name="key" defaultValue={value?.key ?? ""} required /></label>
      <label>Indicador<input name="label" defaultValue={value?.label ?? ""} required /></label>
      <label className="full-field">Fórmula<textarea name="formula" defaultValue={value?.formula ?? ""} required /></label>
      <label className="full-field">Descrição<textarea name="description" defaultValue={value?.description ?? ""} required /></label>
    </div>
  );
}

function LevelSelect({ name, value }: { name: string; value?: EmployeeHierarchyLevel }) {
  return (
    <select name={name} defaultValue={value ?? "L1"}>
      {["L1", "L2", "L3", "L4", "L5", "L6"].map((level) => (
        <option key={level} value={level}>{level}</option>
      ))}
    </select>
  );
}
