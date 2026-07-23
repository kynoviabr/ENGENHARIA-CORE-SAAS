"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission } from "@/core/auth/session";
import { employees } from "@/features/pmt/repositories/mock-data";
import type { EmployeeHierarchyLevel } from "@/features/pmt/types";

const MAX_IMPORT_FILE_SIZE = 2 * 1024 * 1024;
const employeeCodeSchema = z.string().trim().min(2).max(40).regex(/^[\p{L}\p{N}._/-]+$/u, "Matrícula com formato inválido.");
const emailSchema = z.string().trim().email().max(160).toLowerCase();
const booleanFromForm = z.preprocess((value) => value === true || value === "true" || value === "yes" || value === "on", z.boolean());

const createEmployeeSchema = z.object({
  employeeCode: employeeCodeSchema,
  fullName: z.string().trim().min(3).max(120),
  email: emailSchema,
  companyUnit: z.string().trim().min(2).max(80),
  maintenanceArea: z.string().trim().min(2).max(80),
  team: z.string().trim().min(1).max(80),
  shift: z.string().trim().min(1).max(40),
  discipline: z.string().trim().min(2).max(80),
  role: z.string().trim().min(2).max(80),
  hierarchyLevel: z.enum(["L1", "L2", "L3", "L4", "L5", "L6"]),
  hierarchyLabel: z.string().trim().min(2).max(80),
  costType: z.enum(["direct", "indirect"]),
  hourlyCost: z.coerce.number().min(0).max(100000),
  canSelfReport: booleanFromForm.default(false)
});

export async function createEmployeeAction(formData: FormData) {
  const session = await requirePermission("pmt.employees.create");
  const input = createEmployeeSchema.parse(Object.fromEntries(formData));
  const now = new Date().toISOString();
  const duplicate = employees.some(
    (employee) => employee.tenantId === session.activeTenant.id && sameCode(employee.employeeCode, input.employeeCode)
  );

  if (duplicate) {
    throw new Error("Já existe funcionário com esta matrícula neste tenant.");
  }

  employees.unshift({
    id: `emp-${randomUUID()}`,
    tenantId: session.activeTenant.id,
    employeeCode: input.employeeCode,
    fullName: input.fullName,
    email: input.email,
    companyUnit: input.companyUnit,
    maintenanceArea: input.maintenanceArea,
    team: input.team,
    shift: input.shift,
    discipline: input.discipline,
    role: input.role,
    hierarchyLevel: input.hierarchyLevel,
    hierarchyLabel: input.hierarchyLabel,
    costType: input.costType,
    hourlyCost: input.hourlyCost,
    status: "active",
    canSelfReport: input.canSelfReport,
    createdAt: now,
    updatedAt: now
  });

  console.log("audit:pmt.employee.created", {
    tenantId: session.activeTenant.id,
    actorUserId: session.user.id,
    input
  });

  revalidatePath("/pmt/funcionarios");
  redirect("/pmt/funcionarios");
}

const updateEmployeeSchema = createEmployeeSchema.omit({ hourlyCost: true }).extend({
  employeeId: z.string().trim().min(2)
});

export async function updateEmployeeAction(formData: FormData) {
  const session = await requirePermission("pmt.employees.update");
  const input = updateEmployeeSchema.parse(Object.fromEntries(formData));
  const employee = employees.find((item) => item.tenantId === session.activeTenant.id && item.id === input.employeeId);

  if (!employee) {
    throw new Error("Funcionário não encontrado.");
  }
  const duplicate = employees.some(
    (item) =>
      item.tenantId === session.activeTenant.id &&
      item.id !== employee.id &&
      sameCode(item.employeeCode, input.employeeCode)
  );

  if (duplicate) {
    throw new Error("Já existe outro funcionário com esta matrícula neste tenant.");
  }

  employee.employeeCode = input.employeeCode;
  employee.fullName = input.fullName;
  employee.email = input.email;
  employee.companyUnit = input.companyUnit;
  employee.maintenanceArea = input.maintenanceArea;
  employee.team = input.team;
  employee.shift = input.shift;
  employee.discipline = input.discipline;
  employee.role = input.role;
  employee.hierarchyLevel = input.hierarchyLevel;
  employee.hierarchyLabel = input.hierarchyLabel;
  employee.costType = input.costType;
  employee.canSelfReport = input.canSelfReport;
  employee.updatedAt = new Date().toISOString();

  console.log("audit:pmt.employee.updated", {
    tenantId: session.activeTenant.id,
    actorUserId: session.user.id,
    employeeId: employee.id,
    employeeCode: employee.employeeCode
  });

  revalidatePath("/pmt/funcionarios");
}

export async function importEmployeesAction(formData: FormData) {
  const session = await requirePermission("pmt.employees.import");
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Arquivo CSV obrigatório.");
  }
  if (file.size > MAX_IMPORT_FILE_SIZE) {
    throw new Error("Arquivo CSV excede o limite de 2 MB.");
  }
  if (!isCsvFile(file)) {
    throw new Error("Envie um arquivo CSV válido.");
  }

  const text = await file.text();
  const rows = parseCsv(text);
  const now = new Date().toISOString();
  const seenCodes = new Set(employees.filter((employee) => employee.tenantId === session.activeTenant.id).map((employee) => normalizeCode(employee.employeeCode)));
  const imported = rows.map((row, index) => {
    const parsed = createEmployeeSchema.safeParse({
      employeeCode: row.employeeCode,
      fullName: row.fullName,
      email: row.email,
      companyUnit: row.companyUnit,
      maintenanceArea: row.maintenanceArea,
      team: row.team,
      shift: row.shift,
      discipline: row.discipline,
      role: row.role,
      hierarchyLevel: getHierarchyLevel(row.hierarchyLevel),
      hierarchyLabel: row.hierarchyLabel || getDefaultHierarchyLabel(row.hierarchyLevel),
      costType: row.costType === "indirect" ? "indirect" : "direct",
      hourlyCost: row.hourlyCost || 0,
      canSelfReport: row.canSelfReport
    });

    if (!parsed.success) {
      throw new Error(`Linha ${index + 2} inválida no CSV de funcionários.`);
    }

    const input = parsed.data;
    const normalizedCode = normalizeCode(input.employeeCode);
    if (seenCodes.has(normalizedCode)) {
      throw new Error(`Matrícula duplicada no CSV ou cadastro: ${input.employeeCode}.`);
    }
    seenCodes.add(normalizedCode);

    return {
      id: `emp-${randomUUID()}`,
      tenantId: session.activeTenant.id,
      employeeCode: input.employeeCode,
      fullName: input.fullName,
      email: input.email,
      companyUnit: input.companyUnit,
      maintenanceArea: input.maintenanceArea,
      team: input.team,
      shift: input.shift,
      discipline: input.discipline,
      role: input.role,
      hierarchyLevel: input.hierarchyLevel,
      hierarchyLabel: input.hierarchyLabel,
      costType: input.costType,
      hourlyCost: input.hourlyCost,
      status: "active" as const,
      canSelfReport: input.canSelfReport,
      createdAt: now,
      updatedAt: now
    };
  });

  employees.unshift(...imported);

  console.log("audit:pmt.employees.imported", {
    tenantId: session.activeTenant.id,
    actorUserId: session.user.id,
    fileName: file.name,
    fileSize: file.size,
    importedCount: imported.length
  });

  revalidatePath("/pmt/funcionarios");
  redirect("/pmt/funcionarios");
}

export async function sendEmployeeInvitesAction() {
  const session = await requirePermission("pmt.employees.update");
  const tenantEmployees = employees.filter((employee) => employee.tenantId === session.activeTenant.id && employee.status === "active" && employee.email);

  console.log("audit:pmt.employee_invites.requested", {
    tenantId: session.activeTenant.id,
    actorUserId: session.user.id,
    employeeCount: tenantEmployees.length,
    deliveryChannel: "email",
    status: "queued_mock"
  });

  revalidatePath("/pmt/funcionarios");
}

export async function resendEmployeeInviteAction(employeeId: string) {
  const session = await requirePermission("pmt.employees.update");
  const employee = employees.find((item) => item.tenantId === session.activeTenant.id && item.id === employeeId);

  if (!employee) {
    throw new Error("Funcionário não encontrado.");
  }
  if (!employee.email) {
    throw new Error("Funcionário sem e-mail cadastrado para envio de convite.");
  }

  console.log("audit:pmt.employee_invite.resent", {
    tenantId: session.activeTenant.id,
    actorUserId: session.user.id,
    employeeId: employee.id,
    employeeCode: employee.employeeCode,
    deliveryChannel: "email",
    status: "queued_mock"
  });

  revalidatePath("/pmt/funcionarios");
}

export async function blockEmployeeAccessAction(employeeId: string) {
  const session = await requirePermission("pmt.employees.update");
  const employee = employees.find((item) => item.tenantId === session.activeTenant.id && item.id === employeeId);

  if (!employee) {
    throw new Error("Funcionário não encontrado.");
  }

  employee.status = "inactive";
  employee.updatedAt = new Date().toISOString();

  console.log("audit:pmt.employee_access.blocked", {
    tenantId: session.activeTenant.id,
    actorUserId: session.user.id,
    employeeId: employee.id,
    employeeCode: employee.employeeCode,
    reason: "saiu_da_empresa",
    status: "blocked_mock"
  });

  revalidatePath("/pmt/funcionarios");
}

export async function reactivateEmployeeAccessAction(employeeId: string) {
  const session = await requirePermission("pmt.employees.update");
  const employee = employees.find((item) => item.tenantId === session.activeTenant.id && item.id === employeeId);

  if (!employee) {
    throw new Error("Funcionário não encontrado.");
  }

  employee.status = "active";
  employee.updatedAt = new Date().toISOString();

  console.log("audit:pmt.employee_access.reactivated", {
    tenantId: session.activeTenant.id,
    actorUserId: session.user.id,
    employeeId: employee.id,
    employeeCode: employee.employeeCode,
    status: "reactivated_mock"
  });

  revalidatePath("/pmt/funcionarios");
}

function parseCsv(text: string) {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  if (!headerLine) throw new Error("CSV sem cabeçalho.");
  const headers = splitCsvLine(headerLine.replace(/^\uFEFF/, ""));
  const requiredHeaders = ["employeeCode", "fullName", "email", "companyUnit", "maintenanceArea", "team", "shift", "discipline", "role", "hierarchyLevel", "hierarchyLabel", "costType", "hourlyCost", "canSelfReport"];
  const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) {
    throw new Error(`CSV sem colunas obrigatórias: ${missingHeaders.join(", ")}.`);
  }

  return lines.filter((line) => line.trim()).map((line) => {
    const values = splitCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function splitCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === "\"") {
      if (quoted && line[index + 1] === "\"") {
        current += "\"";
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

function isCsvFile(file: File) {
  return file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv" || file.type === "application/vnd.ms-excel";
}

function normalizeCode(value: string) {
  return value.trim().toUpperCase();
}

function sameCode(left: string, right: string) {
  return normalizeCode(left) === normalizeCode(right);
}

function getHierarchyLevel(value?: string): EmployeeHierarchyLevel {
  if (value === "L1" || value === "L2" || value === "L3" || value === "L4" || value === "L5" || value === "L6") {
    return value;
  }

  return "L4";
}

function getDefaultHierarchyLabel(value?: string) {
  const labels: Record<string, string> = {
    L1: "Diretor",
    L2: "Gerente",
    L3: "Supervisor",
    L4: "Mecânico",
    L5: "Eletricista",
    L6: "Ajudante"
  };

  return labels[value ?? ""] ?? "Mecânico";
}
