import { UserPlus } from "lucide-react";
import { requirePermission } from "@/core/auth/session";
import { createEmployeeAction } from "@/features/pmt/actions/employee-actions";
import { getEmployeeInputsSummary } from "@/features/pmt/services/queries";

export default async function NewEmployeePage() {
  const session = await requirePermission("pmt.employees.create");
  const { options } = await getEmployeeInputsSummary(session.activeTenant.id);

  return (
    <div className="page-stack narrow">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Cadastro manual</span>
          <h1>Novo funcionário</h1>
          <p>Use este cadastro para funcionários que preencherão o diário digital ou serão medidos em campo. O funcionário operacional é separado da conta de usuário e poderá ser vinculado a projetos.</p>
        </div>
      </section>

      <form action={createEmployeeAction} className="panel form-grid">
        <label>
          Código / matrícula
          <input name="employeeCode" required maxLength={40} placeholder="MEC-014" />
        </label>
        <label>
          Nome completo
          <input name="fullName" required maxLength={120} placeholder="Nome do funcionário" />
        </label>
        <label>
          E-mail
          <input name="email" type="email" required maxLength={160} placeholder="nome@empresa.com.br" />
        </label>
        <label>
          Unidade / planta
          <select name="companyUnit" required defaultValue={options.units[0] ?? ""}>
            {options.units.map((unit) => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </label>
        <label>
          Área de manutenção
          <select name="maintenanceArea" required defaultValue={options.maintenanceAreas[0] ?? ""}>
            {options.maintenanceAreas.map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </label>
        <label>
          Equipe
          <select name="team" required defaultValue={options.teams[0] ?? ""}>
            {options.teams.map((team) => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </label>
        <label>
          Turno
          <select name="shift" required defaultValue={options.shifts[0] ?? ""}>
            {options.shifts.map((shift) => (
              <option key={shift} value={shift}>{shift}</option>
            ))}
          </select>
        </label>
        <label>
          Disciplina
          <select name="discipline" required defaultValue={options.disciplines[0] ?? ""}>
            {options.disciplines.map((discipline) => (
              <option key={discipline} value={discipline}>{discipline}</option>
            ))}
          </select>
        </label>
        <label>
          Função
          <select name="role" required defaultValue={options.roles[0]?.name ?? ""}>
            {options.roles.map((role) => (
              <option key={`${role.name}-${role.discipline}`} value={role.name}>{role.name}</option>
            ))}
          </select>
        </label>
        <label>
          Nível hierárquico
          <select name="hierarchyLevel" required defaultValue="L4">
            {options.hierarchyLevels.map((option) => (
              <option key={option.level} value={option.level}>{option.level} - {option.label}</option>
            ))}
          </select>
        </label>
        <label>
          Nome do nível
          <select name="hierarchyLabel" required defaultValue={options.hierarchyLevels[0]?.label ?? ""}>
            {options.hierarchyLevels.map((option) => (
              <option key={option.label} value={option.label}>{option.label}</option>
            ))}
          </select>
        </label>
        <label>
          Classificação de custo
          <select name="costType" required defaultValue="direct">
            <option value="direct">Custo direto</option>
            <option value="indirect">Custo indireto</option>
          </select>
        </label>
        <label>
          Custo horário da função (R$)
          <input name="hourlyCost" required type="number" min="0" step="0.01" placeholder="86.00" />
        </label>
        <label className="checkbox-label">
          <input name="canSelfReport" type="checkbox" value="true" />
          Funcionário preenche o próprio relatório diário
        </label>
        <button className="primary-button" type="submit">
          <UserPlus size={18} />
          Salvar funcionário
        </button>
      </form>
    </div>
  );
}
