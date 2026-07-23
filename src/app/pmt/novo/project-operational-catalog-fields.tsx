"use client";

import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

type SimpleCatalogFieldsProps = {
  fieldName: string;
  initialItems: string[];
  placeholder: string;
  onItemsConfirm?: (items: string[]) => void;
};

export function ProjectTeamsFields() {
  return <SimpleCatalogFields fieldName="teams" initialItems={["Equipe A", "Equipe B"]} placeholder="Ex.: Equipe A" />;
}

export function ProjectDisciplinesFields() {
  return (
    <SimpleCatalogFields
      fieldName="disciplines"
      initialItems={["Mecânica", "Elétrica", "Instrumentação"]}
      placeholder="Ex.: Mecânica"
      onItemsConfirm={(items) => {
        window.dispatchEvent(new CustomEvent("pmt:disciplines-change", { detail: items }));
      }}
    />
  );
}

export function ProjectShiftsFields() {
  const [shiftCount, setShiftCount] = useState(2);
  const [shifts, setShifts] = useState(["Diurno", "Noturno"]);
  const [dirty, setDirty] = useState(false);
  const [confirmed, setConfirmed] = useState(true);

  function changeShiftCount(value: number) {
    const nextCount = Math.max(1, Math.min(value || 1, 12));

    setDirty(true);
    setConfirmed(false);
    setShiftCount(nextCount);
    setShifts((current) =>
      Array.from({ length: nextCount }, (_, index) => current[index] ?? `Turno ${index + 1}`)
    );
  }

  function updateShift(index: number, value: string) {
    setDirty(true);
    setConfirmed(false);
    setShifts((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function confirmShifts() {
    setDirty(false);
    setConfirmed(true);
    window.dispatchEvent(new CustomEvent("pmt:shifts-change", { detail: shifts.filter(Boolean) }));
  }

  return (
    <div className="project-operational-list">
      <SectionConfirmState confirmed={confirmed} dirty={dirty} />
      <label className="shift-count-field">
        Quantidade de turnos considerados
        <input name="shifts" type="number" min="1" max="12" value={shiftCount} onChange={(event) => changeShiftCount(Number(event.target.value))} />
      </label>
      <div className="project-operational-list-header" aria-hidden="true">
        <span>Turno</span>
        <span>Nome utilizado neste projeto</span>
      </div>
      {shifts.map((shift, index) => (
        <div className="project-operational-list-row" key={`shift-${index}`}>
          <span>Turno {index + 1}</span>
          <input name={`shiftNames[${index}]`} value={shift} maxLength={80} placeholder="Ex.: Diurno" onChange={(event) => updateShift(index, event.target.value)} />
        </div>
      ))}
      <div className="catalog-inline-actions">
        <ConfirmCatalogButton dirty={dirty} onConfirm={confirmShifts} />
      </div>
    </div>
  );
}

function SimpleCatalogFields({ fieldName, initialItems, placeholder, onItemsConfirm }: SimpleCatalogFieldsProps) {
  const [items, setItems] = useState(initialItems);
  const [dirty, setDirty] = useState(false);
  const [confirmed, setConfirmed] = useState(true);

  function commitItems(nextItems: string[]) {
    setItems(nextItems);
    setDirty(true);
    setConfirmed(false);
  }

  function addItem() {
    commitItems([...items, ""]);
  }

  function updateItem(index: number, value: string) {
    commitItems(items.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function removeItem(index: number) {
    commitItems(items.filter((_, itemIndex) => itemIndex !== index));
  }

  function confirmItems() {
    setDirty(false);
    setConfirmed(true);
    onItemsConfirm?.(items.filter(Boolean));
  }

  return (
    <div className="project-operational-list">
      <SectionConfirmState confirmed={confirmed} dirty={dirty} />
      <div className="project-operational-list-header" aria-hidden="true">
        <span>Item</span>
        <span>Nome utilizado neste projeto</span>
        <span />
      </div>
      {items.map((item, index) => (
        <div className="project-operational-list-row" key={`${fieldName}-${index}`}>
          <span>{index + 1}</span>
          <input name={`${fieldName}[${index}]`} value={item} maxLength={80} placeholder={placeholder} onChange={(event) => updateItem(index, event.target.value)} />
          <button className="icon-button compact-action" type="button" onClick={() => removeItem(index)} aria-label={`Remover ${item || "item"}`}>
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <div className="catalog-inline-actions">
        <button className="secondary-button contact-add" type="button" onClick={addItem}>
          <Plus size={15} />
          Adicionar item
        </button>
        <ConfirmCatalogButton dirty={dirty} onConfirm={confirmItems} />
      </div>
    </div>
  );
}

function SectionConfirmState({ confirmed, dirty }: { confirmed: boolean; dirty: boolean }) {
  return (
    <div className={`section-save-state ${dirty ? "is-dirty" : ""}`}>
      <span>
        <CheckCircle2 size={14} />
        {confirmed ? "Alterações salvas" : "Alterações pendentes"}
      </span>
    </div>
  );
}

function ConfirmCatalogButton({ dirty, onConfirm }: { dirty: boolean; onConfirm: () => void }) {
  return (
    <button className="secondary-button confirm-section-button" type="button" onClick={onConfirm} disabled={!dirty}>
      Confirmar cadastro
    </button>
  );
}
