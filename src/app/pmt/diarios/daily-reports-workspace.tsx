"use client";

import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/features/pmt/components/status-badge";
import { formatDuration } from "@/features/pmt/services/calculations";
import type { PmtDailyReport, PmtDailyReportEntry, PmtEmployee, PmtStudy } from "@/features/pmt/types";

type DailyReportRow = {
  report: PmtDailyReport;
  employee?: PmtEmployee;
  study?: PmtStudy;
  entries: PmtDailyReportEntry[];
};

type DailyFilter = "all" | "draft" | "submitted" | "validated";

const filterLabels: Record<DailyFilter, string> = {
  all: "Todos",
  draft: "Pendentes",
  submitted: "Recebidos",
  validated: "Validados"
};

export function DailyReportsWorkspace({ reports }: { reports: DailyReportRow[] }) {
  const [selectedFilter, setSelectedFilter] = useState<DailyFilter>("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [shiftFilter, setShiftFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<DailyFilter>("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const shiftOptions = useMemo(() => Array.from(new Set(reports.map(({ report }) => report.shift))).sort(), [reports]);
  const counts: Record<DailyFilter, number> = {
    all: reports.length,
    draft: reports.filter(({ report }) => report.status === "draft").length,
    submitted: reports.filter(({ report }) => report.status === "submitted").length,
    validated: reports.filter(({ report }) => report.status === "validated").length
  };
  const effectiveStatusFilter = statusFilter !== "all" ? statusFilter : selectedFilter;
  const filteredReports = reports.filter(({ report, employee, study }) => {
    const normalizedSearch = searchFilter.trim().toLowerCase();
    const searchTarget = `${employee?.fullName ?? ""} ${employee?.employeeCode ?? report.employeeId} ${study?.name ?? ""}`.toLowerCase();

    if (normalizedSearch && !searchTarget.includes(normalizedSearch)) return false;
    if (effectiveStatusFilter !== "all" && report.status !== effectiveStatusFilter) return false;
    if (startDateFilter && report.reportDate < startDateFilter) return false;
    if (endDateFilter && report.reportDate > endDateFilter) return false;
    if (shiftFilter !== "all" && report.shift !== shiftFilter) return false;
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / rowsPerPage));
  const visibleReports = useMemo(
    () => filteredReports.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage),
    [currentPage, filteredReports, rowsPerPage]
  );
  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, index) => index + 1), [totalPages]);

  function selectFilter(filter: DailyFilter) {
    setSelectedFilter(filter);
    setStatusFilter(filter);
    setCurrentPage(1);
  }

  function changeRowsPerPage(value: number) {
    setRowsPerPage(value);
    setCurrentPage(1);
  }

  return (
    <>
      <section className="metrics-grid daily-filter-grid" aria-label="Filtros de diários">
        {(Object.keys(filterLabels) as DailyFilter[]).map((filter) => (
          <button
            className="metric metric-selector"
            key={filter}
            type="button"
            onClick={() => selectFilter(filter)}
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
          <h2>Relatórios recebidos</h2>
          <div className="panel-title-actions">
            <button className="secondary-button compact-button" type="button" onClick={() => {
              setStartDateFilter("");
              setEndDateFilter("");
              setShiftFilter("all");
              setStatusFilter("all");
              setSelectedFilter("all");
              setSearchFilter("");
              setCurrentPage(1);
            }}>
              Limpar filtros
            </button>
            <Clock3 size={18} />
          </div>
        </div>
        <div className="daily-table-filters">
          <label className="inline-filter-field">
            <span>Buscar</span>
            <input
              type="search"
              value={searchFilter}
              placeholder="Funcionário, matrícula ou projeto"
              onChange={(event) => {
                setSearchFilter(event.target.value);
                setCurrentPage(1);
              }}
            />
          </label>
          <div className="inline-filter-field date-range-filter">
            <div>
              <label>
                <span>De</span>
                <input aria-label="Data inicial" type="date" value={startDateFilter} onChange={(event) => {
                setStartDateFilter(event.target.value);
                setCurrentPage(1);
              }} />
              </label>
              <label>
                <span>Até</span>
                <input aria-label="Data final" type="date" value={endDateFilter} onChange={(event) => {
                setEndDateFilter(event.target.value);
                setCurrentPage(1);
              }} />
              </label>
            </div>
          </div>
          <label className="inline-filter-field">
            <span>Turno</span>
            <select value={shiftFilter} onChange={(event) => {
              setShiftFilter(event.target.value);
              setCurrentPage(1);
            }}>
              <option value="all">Todos</option>
              {shiftOptions.map((shift) => (
                <option key={shift} value={shift}>{shift}</option>
              ))}
            </select>
          </label>
          <label className="inline-filter-field">
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => {
              const value = event.target.value as DailyFilter;
              setStatusFilter(value);
              setSelectedFilter(value);
              setCurrentPage(1);
            }}>
              {(Object.keys(filterLabels) as DailyFilter[]).map((filter) => (
                <option key={filter} value={filter}>{filterLabels[filter]}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="table-wrap daily-table-wrap">
          <table className="daily-table">
            <thead>
              <tr>
                <th>Funcionário</th>
                <th>Matrícula</th>
                <th>Projeto</th>
                <th>Data</th>
                <th>Turno</th>
                <th>Itens</th>
                <th>Tempo</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visibleReports.map(({ report, employee, study, entries }) => (
                <tr key={report.id}>
                  <td>{employee?.fullName ?? "Funcionário não encontrado"}</td>
                  <td>{employee?.employeeCode ?? report.employeeId}</td>
                  <td>{study?.name ?? "Projeto não encontrado"}</td>
                  <td>{formatDate(report.reportDate)}</td>
                  <td>{report.shift}</td>
                  <td>{entries.length}</td>
                  <td>{formatDuration(report.totalReportedSeconds)}</td>
                  <td><StatusBadge value={report.status} /></td>
                  <td>
                    <Link className="icon-link" href={`/pmt/diarios/${report.id}`} aria-label={`Abrir diário ${report.id}`}>
                      <ArrowRight size={17} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="employee-pagination">
          <label>
            Linhas
            <select value={rowsPerPage} onChange={(event) => changeRowsPerPage(Number(event.target.value))}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
          <span>
            {filteredReports.length === 0 ? "0" : `${(currentPage - 1) * rowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, filteredReports.length)}`} de {filteredReports.length}
          </span>
          <div className="employee-page-buttons" aria-label="Paginação de diários">
            {pageNumbers.map((page) => (
              <button key={page} type="button" onClick={() => setCurrentPage(page)} aria-current={currentPage === page ? "page" : undefined}>
                {page}
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}
