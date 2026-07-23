import { requirePermission } from "@/core/auth/session";
import { employees } from "@/features/pmt/repositories/mock-data";

const headers = [
  "matricula",
  "nome",
  "email",
  "unidade",
  "area_manutencao",
  "equipe",
  "turno",
  "disciplina",
  "funcao",
  "nivel_hierarquico",
  "nome_do_nivel",
  "classificacao_custo",
  "status",
  "preenche_proprio_relatorio"
];

export async function GET() {
  const session = await requirePermission("pmt.employees.view");
  const rows = employees
    .filter((employee) => employee.tenantId === session.activeTenant.id)
    .map((employee) => [
      employee.employeeCode,
      employee.fullName,
      employee.email ?? "",
      employee.companyUnit,
      employee.maintenanceArea,
      employee.team,
      employee.shift,
      employee.discipline,
      employee.role,
      employee.hierarchyLevel,
      employee.hierarchyLabel,
      employee.costType === "direct" ? "Direto" : "Indireto",
      employee.status === "active" ? "Ativo" : "Inativo",
      employee.canSelfReport ? "Sim" : "Não"
    ]);
  const csv = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(";")).join("\n");

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Disposition": "attachment; filename=\"cadastro-funcionarios-pmt.csv\"",
      "Content-Type": "text/csv; charset=utf-8"
    }
  });
}

function escapeCsvCell(value: string | number | boolean) {
  return `"${String(value).replace(/"/g, "\"\"")}"`;
}
