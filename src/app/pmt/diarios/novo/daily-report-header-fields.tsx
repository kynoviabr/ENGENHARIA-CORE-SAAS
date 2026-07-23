"use client";

import { useMemo, useState } from "react";
import type { PmtEmployee, PmtStudy } from "@/features/pmt/types";

type DailyReportHeaderFieldsProps = {
  studies: PmtStudy[];
  employees: PmtEmployee[];
  shiftsByStudy: Record<string, string[]>;
};

export function DailyReportHeaderFields({ studies, employees, shiftsByStudy }: DailyReportHeaderFieldsProps) {
  const [studyId, setStudyId] = useState(studies[0]?.id ?? "");
  const selectedStudy = useMemo(() => studies.find((study) => study.id === studyId) ?? studies[0], [studies, studyId]);
  const shiftOptions = useMemo(() => {
    const projectShifts = shiftsByStudy[studyId] ?? [];
    if (projectShifts.length > 0) return projectShifts;

    return Array.from(new Set(employees.map((employee) => employee.shift).filter(Boolean)));
  }, [employees, shiftsByStudy, studyId]);

  return (
    <>
      <label>
        Projeto
        <select name="studyId" required value={studyId} onChange={(event) => setStudyId(event.target.value)}>
          {studies.map((study) => (
            <option key={study.id} value={study.id}>{study.name}</option>
          ))}
        </select>
      </label>
      <label>
        Funcionário
        <select name="employeeId" required>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>{employee.employeeCode} - {employee.fullName}</option>
          ))}
        </select>
      </label>
      <label>
        Data
        <input
          name="reportDate"
          required
          type="date"
          key={studyId}
          min={selectedStudy?.periodStart}
          max={selectedStudy?.periodEnd}
          defaultValue={selectedStudy?.periodStart}
        />
      </label>
      <label>
        Turno
        <select name="shift" required key={studyId} defaultValue={shiftOptions[0] ?? ""}>
          {shiftOptions.map((shift) => (
            <option key={shift} value={shift}>{shift}</option>
          ))}
        </select>
      </label>
    </>
  );
}
