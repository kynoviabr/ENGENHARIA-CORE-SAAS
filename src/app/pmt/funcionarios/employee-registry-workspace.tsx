"use client";

import { UserRoundCheck } from "lucide-react";
import { useState } from "react";
import type { EmployeeRegistryOptions, PmtEmployee } from "@/features/pmt/types";
import { EmployeeOperationalTable } from "./employee-operational-table";

type EmployeeFilter = "all" | "active" | "inactive" | "direct" | "indirect";

const filterLabels: Record<EmployeeFilter, string> = {
  all: "Todos",
  active: "Ativos",
  inactive: "Inativos",
  direct: "Custo direto",
  indirect: "Custo indireto"
};

export function EmployeeRegistryWorkspace({ employees, options }: { employees: PmtEmployee[]; options: EmployeeRegistryOptions }) {
  const counts: Record<EmployeeFilter, number> = {
    all: employees.length,
    active: employees.filter((employee) => employee.status === "active").length,
    inactive: employees.filter((employee) => employee.status === "inactive").length,
    direct: employees.filter((employee) => employee.costType === "direct").length,
    indirect: employees.filter((employee) => employee.costType === "indirect").length
  };
  const [selectedFilter, setSelectedFilter] = useState<EmployeeFilter>("all");
  const filteredEmployees = employees.filter((employee) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "active" || selectedFilter === "inactive") return employee.status === selectedFilter;
    return employee.costType === selectedFilter;
  });

  return (
    <>
      <section className="metrics-grid employee-filter-grid" aria-label="Filtros do cadastro de funcionários">
        {(Object.keys(filterLabels) as EmployeeFilter[]).map((filter) => (
          <button
            className="metric metric-selector"
            key={filter}
            type="button"
            onClick={() => setSelectedFilter(filter)}
            aria-pressed={selectedFilter === filter}
          >
            <span>{filterLabels[filter]}</span>
            <strong>{counts[filter]}</strong>
            <small>{filter === "all" ? "cadastro completo" : "filtrar lista"}</small>
          </button>
        ))}
      </section>

      <section className="panel">
        <div className="panel-title">
          <h2>Cadastro operacional</h2>
          <UserRoundCheck size={18} />
        </div>
        <EmployeeOperationalTable key={selectedFilter} employees={filteredEmployees} options={options} />
      </section>
    </>
  );
}
