"use client";

import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { PmtRoleCatalogItem } from "@/features/pmt/services/system-catalogs";

type ProjectRoleFieldsProps = {
  roles: PmtRoleCatalogItem[];
};

type RoleRow = PmtRoleCatalogItem & {
  projectName: string;
};

export function ProjectRoleFields({ roles }: ProjectRoleFieldsProps) {
  const [items, setItems] = useState<RoleRow[]>(
    roles.map((role) => ({
      ...role,
      projectName: role.name
    }))
  );
  const [disciplines, setDisciplines] = useState(["Mecânica", "Elétrica", "Instrumentação"]);
  const [dirty, setDirty] = useState(false);
  const [confirmed, setConfirmed] = useState(true);

  useEffect(() => {
    function handleDisciplinesChange(event: Event) {
      const nextDisciplines = (event as CustomEvent<string[]>).detail;
      if (Array.isArray(nextDisciplines) && nextDisciplines.length > 0) {
        setDisciplines(nextDisciplines);
      }
    }

    window.addEventListener("pmt:disciplines-change", handleDisciplinesChange);
    return () => window.removeEventListener("pmt:disciplines-change", handleDisciplinesChange);
  }, []);

  const disciplineOptions = useMemo(() => {
    const roleDisciplines = items.map((role) => role.discipline).filter(Boolean);
    return Array.from(new Set([...disciplines, ...roleDisciplines]));
  }, [disciplines, items]);

  function addRole() {
    setDirty(true);
    setConfirmed(false);
    setItems((current) => [
      ...current,
      {
        name: "",
        projectName: "",
        discipline: "",
        defaultHierarchyLevel: "L4",
        defaultCostType: "direct",
        defaultSelfReport: true
      }
    ]);
  }

  function removeRole(index: number) {
    setDirty(true);
    setConfirmed(false);
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function updateRole(index: number, field: keyof RoleRow, value: string) {
    setDirty(true);
    setConfirmed(false);
    setItems((current) => current.map((role, itemIndex) => (itemIndex === index ? { ...role, [field]: value } : role)));
  }

  function confirmRoles() {
    setDirty(false);
    setConfirmed(true);
  }

  return (
    <div className="project-role-list full-field">
      <div className={`section-save-state ${dirty ? "is-dirty" : ""}`}>
        <span>
          <CheckCircle2 size={14} />
          {confirmed ? "Alterações salvas" : "Alterações pendentes"}
        </span>
      </div>

      <div className="project-role-grid project-role-header" aria-hidden="true">
        <span>Cargo sugerido</span>
        <span>Cargo / função no cliente</span>
        <span>Disciplina</span>
        <span>Nível</span>
        <span>Custeio</span>
        <span />
      </div>

      {items.map((role, index) => (
        <div className="project-role-grid project-role-row" key={`${role.name}-${index}`}>
          <input type="hidden" name={`projectRoles[${index}][sourceName]`} value={role.name} />
          <div className="project-role-source">
            <span>Cargo sugerido</span>
            <strong>{role.name || "Novo cargo"}</strong>
          </div>
          <label>
            <span>Cargo / função no cliente</span>
            <input
              name={`projectRoles[${index}][projectName]`}
              value={role.projectName}
              maxLength={80}
              placeholder="Nome usado pelo cliente"
              onChange={(event) => updateRole(index, "projectName", event.target.value)}
            />
          </label>
          <label>
            <span>Disciplina</span>
            <select
              name={`projectRoles[${index}][discipline]`}
              value={role.discipline}
              onChange={(event) => updateRole(index, "discipline", event.target.value)}
            >
              <option value="">Selecionar</option>
              {disciplineOptions.map((discipline) => (
                <option key={discipline} value={discipline}>
                  {discipline}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Nível</span>
            <select
              name={`projectRoles[${index}][hierarchyLevel]`}
              defaultValue={role.defaultHierarchyLevel}
              onChange={() => {
                setDirty(true);
                setConfirmed(false);
              }}
            >
              <option value="L1">L1</option>
              <option value="L2">L2</option>
              <option value="L3">L3</option>
              <option value="L4">L4</option>
              <option value="L5">L5</option>
              <option value="L6">L6</option>
            </select>
          </label>
          <label>
            <span>Custeio</span>
            <select
              name={`projectRoles[${index}][costType]`}
              defaultValue={role.defaultCostType}
              onChange={() => {
                setDirty(true);
                setConfirmed(false);
              }}
            >
              <option value="direct">Direto</option>
              <option value="indirect">Indireto</option>
            </select>
          </label>
          <button className="icon-button compact-action" type="button" onClick={() => removeRole(index)} aria-label={`Remover cargo ${role.projectName || index + 1}`}>
            <Trash2 size={15} />
          </button>
        </div>
      ))}

      <div className="catalog-inline-actions">
        <button className="secondary-button contact-add" type="button" onClick={addRole}>
          <Plus size={15} />
          Adicionar cargo
        </button>
        <button className="secondary-button confirm-section-button" type="button" onClick={confirmRoles} disabled={!dirty}>
          Confirmar cadastro
        </button>
      </div>
    </div>
  );
}
