"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { blockEmployeeAccessAction, reactivateEmployeeAccessAction, resendEmployeeInviteAction, updateEmployeeAction } from "@/features/pmt/actions/employee-actions";
import { StatusBadge } from "@/features/pmt/components/status-badge";
import type { EmployeeRegistryOptions, PmtEmployee } from "@/features/pmt/types";

export function EmployeeOperationalTable({ employees, options }: { employees: PmtEmployee[]; options: EmployeeRegistryOptions }) {
  const router = useRouter();
  const [selectedEmployee, setSelectedEmployee] = useState<PmtEmployee | null>(null);
  const [draftEmployee, setDraftEmployee] = useState<PmtEmployee | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(employees.length / rowsPerPage));
  const visibleEmployees = useMemo(
    () => employees.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage),
    [currentPage, employees, rowsPerPage]
  );
  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, index) => index + 1), [totalPages]);

  function changeRowsPerPage(value: number) {
    setRowsPerPage(value);
    setCurrentPage(1);
  }

  function openEmployee(employee: PmtEmployee) {
    setSelectedEmployee(employee);
    setDraftEmployee(employee);
  }

  function closeEmployee() {
    setSelectedEmployee(null);
    setDraftEmployee(null);
  }

  function updateDraft(field: keyof PmtEmployee, value: string | boolean) {
    setDraftEmployee((current) => (current ? { ...current, [field]: value } : current));
  }

  function changeRole(roleName: string) {
    const selectedRole = options.roles.find((role) => role.name === roleName);
    setDraftEmployee((current) => {
      if (!current) return current;

      return {
        ...current,
        role: roleName,
        discipline: selectedRole?.discipline ?? current.discipline,
        hierarchyLevel: selectedRole?.hierarchyLevel ?? current.hierarchyLevel,
        hierarchyLabel: selectedRole?.hierarchyLabel ?? current.hierarchyLabel,
        costType: selectedRole?.costType ?? current.costType
      };
    });
  }

  function changeHierarchyLevel(level: string) {
    const hierarchy = options.hierarchyLevels.find((item) => item.level === level);
    setDraftEmployee((current) => {
      if (!current) return current;

      return {
        ...current,
        hierarchyLevel: hierarchy?.level ?? current.hierarchyLevel,
        hierarchyLabel: hierarchy?.label ?? current.hierarchyLabel
      };
    });
  }

  function saveEmployee(formData: FormData) {
    startTransition(async () => {
      await updateEmployeeAction(formData);
      if (draftEmployee) setSelectedEmployee(draftEmployee);
      router.refresh();
    });
  }

  function resendInvite(employee: PmtEmployee) {
    startTransition(async () => {
      await resendEmployeeInviteAction(employee.id);
      router.refresh();
    });
  }

  function blockAccess(employee: PmtEmployee) {
    startTransition(async () => {
      await blockEmployeeAccessAction(employee.id);
      setSelectedEmployee({ ...employee, status: "inactive" });
      router.refresh();
    });
  }

  function reactivateAccess(employee: PmtEmployee) {
    startTransition(async () => {
      await reactivateEmployeeAccessAction(employee.id);
      setSelectedEmployee({ ...employee, status: "active" });
      router.refresh();
    });
  }

  return (
    <>
      <div className="table-wrap employee-table-wrap">
        <table className="employee-table">
          <thead>
            <tr>
              <th>Matrícula</th>
              <th>Funcionário</th>
              <th>Equipe</th>
              <th>Turno</th>
              <th>Função</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleEmployees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.employeeCode}</td>
                <td>
                  <button className="employee-name-button" type="button" onClick={() => openEmployee(employee)}>
                    <strong>{employee.fullName}</strong>
                  </button>
                </td>
                <td>{employee.team}</td>
                <td>{employee.shift}</td>
                <td>{employee.role}</td>
                <td>
                  <button className="employee-status-button" type="button" onClick={() => openEmployee(employee)}>
                    <StatusBadge value={employee.status} />
                  </button>
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
          {employees.length === 0 ? "0" : `${(currentPage - 1) * rowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, employees.length)}`} de {employees.length}
        </span>
        <div className="employee-page-buttons" aria-label="Paginação de funcionários">
          {pageNumbers.map((page) => (
            <button key={page} type="button" onClick={() => setCurrentPage(page)} aria-current={currentPage === page ? "page" : undefined}>
              {page}
            </button>
          ))}
        </div>
      </div>

      {selectedEmployee && draftEmployee ? (
        <div className="catalog-modal-backdrop employee-modal-backdrop" role="presentation">
          <section className="catalog-modal employee-detail-modal" role="dialog" aria-modal="true" aria-labelledby="employee-detail-title">
            <div className="catalog-modal-title">
              <div>
                <span>Detalhes do funcionário</span>
                <h2 id="employee-detail-title">{selectedEmployee.fullName}</h2>
              </div>
              <button className="icon-button" type="button" onClick={closeEmployee} aria-label="Fechar detalhes do funcionário">
                <X size={18} />
              </button>
            </div>
            <form action={saveEmployee}>
              <input type="hidden" name="employeeId" value={draftEmployee.id} />
              <div className="employee-detail-grid employee-detail-form-grid">
                <label>
                  <span>Matrícula</span>
                  <input name="employeeCode" required maxLength={40} value={draftEmployee.employeeCode} onChange={(event) => updateDraft("employeeCode", event.target.value)} />
                </label>
                <label>
                  <span>Nome completo</span>
                  <input name="fullName" required maxLength={120} value={draftEmployee.fullName} onChange={(event) => updateDraft("fullName", event.target.value)} />
                </label>
                <label>
                  <span>E-mail</span>
                  <input name="email" required type="email" maxLength={160} value={draftEmployee.email ?? ""} onChange={(event) => updateDraft("email", event.target.value)} />
                </label>
                <label>
                  <span>Unidade / planta</span>
                  <select name="companyUnit" required value={draftEmployee.companyUnit} onChange={(event) => updateDraft("companyUnit", event.target.value)}>
                    {withCurrentOption(options.units, draftEmployee.companyUnit).map((unit) => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Área de manutenção</span>
                  <select name="maintenanceArea" required value={draftEmployee.maintenanceArea} onChange={(event) => updateDraft("maintenanceArea", event.target.value)}>
                    {withCurrentOption(options.maintenanceAreas, draftEmployee.maintenanceArea).map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Equipe</span>
                  <select name="team" required value={draftEmployee.team} onChange={(event) => updateDraft("team", event.target.value)}>
                    {withCurrentOption(options.teams, draftEmployee.team).map((team) => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Turno</span>
                  <select name="shift" required value={draftEmployee.shift} onChange={(event) => updateDraft("shift", event.target.value)}>
                    {withCurrentOption(options.shifts, draftEmployee.shift).map((shift) => (
                      <option key={shift} value={shift}>{shift}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Disciplina</span>
                  <select name="discipline" required value={draftEmployee.discipline} onChange={(event) => updateDraft("discipline", event.target.value)}>
                    {withCurrentOption(options.disciplines, draftEmployee.discipline).map((discipline) => (
                      <option key={discipline} value={discipline}>{discipline}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Cargo / função</span>
                  <select name="role" required value={draftEmployee.role} onChange={(event) => changeRole(event.target.value)}>
                    {withCurrentOption(options.roles.map((role) => role.name), draftEmployee.role).map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Nível hierárquico</span>
                  <select name="hierarchyLevel" required value={draftEmployee.hierarchyLevel} onChange={(event) => changeHierarchyLevel(event.target.value)}>
                    {options.hierarchyLevels.map((item) => (
                      <option key={item.level} value={item.level}>{item.level} - {item.label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Nome do nível</span>
                  <select name="hierarchyLabel" required value={draftEmployee.hierarchyLabel} onChange={(event) => updateDraft("hierarchyLabel", event.target.value)}>
                    {withCurrentOption(options.hierarchyLevels.map((item) => item.label), draftEmployee.hierarchyLabel).map((label) => (
                      <option key={label} value={label}>{label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Classificação de custo</span>
                  <select name="costType" required value={draftEmployee.costType} onChange={(event) => updateDraft("costType", event.target.value)}>
                    <option value="direct">Direto</option>
                    <option value="indirect">Indireto</option>
                  </select>
                </label>
                <label>
                  <span>Apontamento diário</span>
                  <select name="canSelfReport" value={draftEmployee.canSelfReport ? "true" : "false"} onChange={(event) => updateDraft("canSelfReport", event.target.value === "true")}>
                    <option value="true">Funcionário preenche</option>
                    <option value="false">Observador ou gestor preenche</option>
                  </select>
                </label>
              </div>
              <div className="employee-detail-actions">
                <button className="secondary-button" type="button" onClick={() => resendInvite(selectedEmployee)} disabled={isPending}>
                  Reenviar convite
                </button>
                {selectedEmployee.status === "active" ? (
                  <button className="secondary-button danger-button" type="button" onClick={() => blockAccess(selectedEmployee)} disabled={isPending}>
                    Bloquear acesso
                  </button>
                ) : (
                  <button className="primary-button" type="button" onClick={() => reactivateAccess(selectedEmployee)} disabled={isPending}>
                    Reativar acesso
                  </button>
                )}
                <button className="primary-button" type="submit" disabled={isPending}>
                  Salvar alterações
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}

function withCurrentOption(options: string[], current: string) {
  return Array.from(new Set([current, ...options].filter(Boolean)));
}
