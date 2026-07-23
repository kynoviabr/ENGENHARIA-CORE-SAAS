"use client";

import Link from "next/link";
import { ArrowRight, CheckCheck, CircleAlert, Wand2, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { approveDailyReportsAction, normalizeDailyReportsAction, rejectDailyReportsAction } from "@/features/pmt/actions/validation-actions";
import { StatusBadge } from "@/features/pmt/components/status-badge";
import type { PmtDailyReport, PmtEmployee, PmtStudy } from "@/features/pmt/types";

type ValidationQueueItem = {
  report: PmtDailyReport;
  employee?: PmtEmployee | null;
  study?: PmtStudy | null;
  totalDuration: string;
  qualityFlags: string[];
};

type ValidationQueueWorkspaceProps = {
  items: ValidationQueueItem[];
};

export function ValidationQueueWorkspace({ items }: ValidationQueueWorkspaceProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allSelected = items.length > 0 && selectedIds.length === items.length;

  function toggleAll() {
    setSelectedIds(allSelected ? [] : items.map((item) => item.report.id));
  }

  function toggleReport(reportId: string) {
    setSelectedIds((current) =>
      current.includes(reportId) ? current.filter((id) => id !== reportId) : [...current, reportId]
    );
  }

  return (
    <>
      <section className="panel">
        <div className="panel-title validation-panel-title">
          <div>
            <h2>Fila de validação</h2>
            <span>{selectedIds.length} selecionado(s)</span>
          </div>
          <div className="validation-batch-actions">
            <BatchActionForm action={normalizeDailyReportsAction} reportIds={selectedIds}>
              <button className="secondary-button" type="submit" disabled={selectedIds.length === 0}>
                <Wand2 size={17} />
                Normalizar
              </button>
            </BatchActionForm>
            <BatchActionForm action={approveDailyReportsAction} reportIds={selectedIds}>
              <button className="primary-button" type="submit" disabled={selectedIds.length === 0}>
                <CheckCheck size={17} />
                Aprovado
              </button>
            </BatchActionForm>
            <BatchActionForm action={rejectDailyReportsAction} reportIds={selectedIds}>
              <button className="secondary-button danger-button" type="submit" disabled={selectedIds.length === 0}>
                <XCircle size={17} />
                Reprovado
              </button>
            </BatchActionForm>
          </div>
        </div>

        <div className="validation-rule-note">
          <strong>Normalizar</strong>
          <span>Completa diários abaixo de 08:00 com a atividade 10, conforme a Regra de Validação global.</span>
        </div>

        <div className="table-wrap">
          <table className="validation-queue-table">
            <thead>
              <tr>
                <th>
                  <label className="table-check-label">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                    Todos
                  </label>
                </th>
                <th>Funcionário</th>
                <th>Projeto</th>
                <th>Data</th>
                <th>Tempo</th>
                <th>Alertas</th>
                <th>Base de cálculo</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.report.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedSet.has(item.report.id)}
                      onChange={() => toggleReport(item.report.id)}
                      aria-label={`Selecionar apontamento ${item.report.id}`}
                    />
                  </td>
                  <td>
                    <strong>{item.employee?.fullName ?? "Funcionário não encontrado"}</strong>
                    <small>{item.employee?.employeeCode}</small>
                  </td>
                  <td>
                    <strong>{item.study?.name ?? "Projeto não encontrado"}</strong>
                    <small>{item.study?.plant}</small>
                  </td>
                  <td>{item.report.reportDate}</td>
                  <td>{item.totalDuration}</td>
                  <td>
                    {item.qualityFlags.length > 0 ? (
                      <span className="quality-warning"><CircleAlert size={14} /> {item.qualityFlags.length}</span>
                    ) : (
                      <span className="quality-ok">OK</span>
                    )}
                  </td>
                  <td>{item.qualityFlags.length > 0 ? "Revisar antes do cálculo" : "Pronto para decisão"}</td>
                  <td><StatusBadge value={item.report.status} /></td>
                  <td>
                    <Link className="icon-link" href={`/pmt/validacao/${item.report.id}`} aria-label={`Validar diário ${item.report.id}`}>
                      <ArrowRight size={17} />
                    </Link>
                  </td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <span className="empty-table-note">Nenhum diário recebido aguardando validação.</span>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function BatchActionForm({
  action,
  reportIds,
  children
}: {
  action: (formData: FormData) => void | Promise<void>;
  reportIds: string[];
  children: ReactNode;
}) {
  return (
    <form action={action}>
      {reportIds.map((reportId) => (
        <input key={reportId} type="hidden" name="reportIds" value={reportId} />
      ))}
      {children}
    </form>
  );
}
