"use client";

import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { PmtHierarchyCatalogItem } from "@/features/pmt/services/system-catalogs";
import type { EmployeeHierarchyLevel } from "@/features/pmt/types";

type ProjectHierarchyFieldsProps = {
  levels: PmtHierarchyCatalogItem[];
};

type HierarchyRow = PmtHierarchyCatalogItem & {
  projectLabel: string;
};

const levelOptions: EmployeeHierarchyLevel[] = ["L1", "L2", "L3", "L4", "L5", "L6"];

export function ProjectHierarchyFields({ levels }: ProjectHierarchyFieldsProps) {
  const [items, setItems] = useState<HierarchyRow[]>(
    levels.map((level) => ({
      ...level,
      projectLabel: level.label
    }))
  );
  const [dirty, setDirty] = useState(false);
  const [confirmed, setConfirmed] = useState(true);

  function markDirty() {
    setDirty(true);
    setConfirmed(false);
  }

  function addLevel() {
    markDirty();
    setItems((current) => [
      ...current,
      {
        level: "L6",
        label: "",
        projectLabel: "",
        defaultScope: "",
        canSelfReport: true
      }
    ]);
  }

  function removeLevel(index: number) {
    markDirty();
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function confirmHierarchy() {
    setDirty(false);
    setConfirmed(true);
  }

  return (
    <div className="project-hierarchy-list full-field" onChange={markDirty} onInput={markDirty}>
      <div className={`section-save-state ${dirty ? "is-dirty" : ""}`}>
        <span>
          <CheckCircle2 size={14} />
          {confirmed ? "Alterações salvas" : "Alterações pendentes"}
        </span>
      </div>

      <div className="project-hierarchy-grid project-hierarchy-header" aria-hidden="true">
        <span>Nível sugerido</span>
        <span>Nível usado no cliente</span>
        <span>Escopo / referência</span>
        <span>Preenche diário</span>
        <span />
      </div>

      {items.map((item, index) => (
        <div className="project-hierarchy-grid project-hierarchy-row" key={`${item.level}-${item.label}-${index}`}>
          <input type="hidden" name={`projectHierarchy[${index}][sourceLevel]`} value={item.level} />
          <div className="project-hierarchy-source">
            <span>Nível sugerido</span>
            <strong>{item.level} - {item.label || "Novo nível"}</strong>
          </div>
          <label>
            <span>Nível usado no cliente</span>
            <div className="hierarchy-label-pair">
              <select name={`projectHierarchy[${index}][level]`} defaultValue={item.level}>
                {levelOptions.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              <input
                name={`projectHierarchy[${index}][label]`}
                defaultValue={item.projectLabel}
                maxLength={80}
                placeholder="Nome usado pelo cliente"
              />
            </div>
          </label>
          <label>
            <span>Escopo / referência</span>
            <input
              name={`projectHierarchy[${index}][scope]`}
              defaultValue={item.defaultScope}
              maxLength={140}
              placeholder="Escopo deste nível"
            />
          </label>
          <label>
            <span>Preenche diário</span>
            <select name={`projectHierarchy[${index}][canSelfReport]`} defaultValue={item.canSelfReport ? "yes" : "no"}>
              <option value="yes">Sim</option>
              <option value="no">Não</option>
            </select>
          </label>
          <button className="icon-button compact-action" type="button" onClick={() => removeLevel(index)} aria-label={`Remover nível ${item.projectLabel || index + 1}`}>
            <Trash2 size={15} />
          </button>
        </div>
      ))}

      <div className="catalog-inline-actions">
        <button className="secondary-button contact-add" type="button" onClick={addLevel}>
          <Plus size={15} />
          Adicionar nível
        </button>
        <button className="secondary-button confirm-section-button" type="button" onClick={confirmHierarchy} disabled={!dirty}>
          Confirmar cadastro
        </button>
      </div>
    </div>
  );
}
