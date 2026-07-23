"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import type { ActivityCode } from "@/features/pmt/types";

type DailyReportEntryFieldsProps = {
  activityCodes: ActivityCode[];
};

export function DailyReportEntryFields({ activityCodes }: DailyReportEntryFieldsProps) {
  const [lines, setLines] = useState([1, 2]);

  function addActivity() {
    setLines((current) => [...current, (current.at(-1) ?? 0) + 1]);
  }

  return (
    <>
      {lines.map((line, index) => (
        <fieldset className="entry-row" key={line}>
          <legend>Atividade {index + 1}</legend>
          <label>
            Início
            <input name={`startTime${line}`} required={index === 0} type="time" />
          </label>
          <label>
            Fim
            <input name={`endTime${line}`} required={index === 0} type="time" />
          </label>
          <label>
            OS / serviço
            <input name={`workOrder${line}`} required={index === 0} maxLength={80} placeholder="OS-00000" />
          </label>
          <label>
            Código BTT
            <select name={`activityCode${line}`} required={index === 0}>
              <option value="">Selecionar</option>
              {activityCodes.map((code) => (
                <option key={code.code} value={code.code}>{code.code} - {code.label}</option>
              ))}
            </select>
          </label>
          <label className="entry-note">
            Observação
            <input name={`note${line}`} maxLength={240} placeholder="O que aconteceu, impedimento, detalhe da OS ou contexto de espera" />
          </label>
        </fieldset>
      ))}

      <button className="secondary-button contact-add" type="button" onClick={addActivity}>
        <Plus size={16} />
        Adicionar atividade
      </button>
    </>
  );
}
