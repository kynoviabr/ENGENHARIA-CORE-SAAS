"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission } from "@/core/auth/session";
import { studies } from "@/features/pmt/repositories/mock-data";
import { benchmarkCatalog } from "@/features/pmt/services/system-catalogs";
import type { EmployeeCostType, EmployeeHierarchyLevel } from "@/features/pmt/types";

const createStudySchema = z.object({
  name: z.string().trim().min(3).max(120),
  client: z.string().trim().min(2).max(80),
  plant: z.string().trim().min(2).max(80),
  area: z.string().trim().min(2).max(80).optional(),
  "maintenanceAreas[0]": z.string().trim().min(2).max(80).optional(),
  operationalArea: z.string().trim().max(80).optional(),
  periodStart: z.string().trim().date(),
  periodEnd: z.string().trim().date(),
  plannedCollectionDays: z.coerce.number().min(1).max(120).optional(),
  plannedEmployeeSample: z.coerce.number().min(1).max(5000).optional(),
  shifts: z.coerce.number().min(1).max(12).optional(),
  benchmarkSegment: z.string().trim().min(2).max(120),
  collectionMode: z.enum(["self_report", "observer", "hybrid"]),
  costingMode: z.enum(["direct_indirect", "direct_only", "later"]).optional(),
  targetCoverage: z.coerce.number().min(10).max(100)
}).refine((input) => input.periodEnd >= input.periodStart, {
  message: "Data final deve ser maior ou igual à data inicial.",
  path: ["periodEnd"]
});

export async function createStudyAction(formData: FormData) {
  const session = await requirePermission("pmt.projects.create");
  const input = createStudySchema.parse(Object.fromEntries(formData));
  const now = new Date().toISOString();
  const maintenanceArea = input["maintenanceAreas[0]"] ?? input.area ?? "Manutenção";
  const teams = uniqueValues(getIndexedValues(formData, "teams"));
  const shifts = uniqueValues(getIndexedValues(formData, "shiftNames"));
  const disciplines = uniqueValues(getIndexedValues(formData, "disciplines"));
  if (teams.length === 0) throw new Error("Cadastre pelo menos uma equipe do projeto.");
  if (shifts.length === 0) throw new Error("Cadastre pelo menos um turno do projeto.");
  if (disciplines.length === 0) throw new Error("Cadastre pelo menos uma disciplina do projeto.");
  if (input.shifts && shifts.length < input.shifts) {
    throw new Error("A quantidade de turnos considerados é maior que os turnos cadastrados.");
  }
  const projectHierarchy = getIndexedObjects(formData, "projectHierarchy").map((item) => ({
    level: getHierarchyLevel(item.level),
    label: item.label || getDefaultHierarchyLabel(item.level),
    scope: item.scope || "",
    canSelfReport: item.canSelfReport === "yes"
  }));
  const projectRoles = getIndexedObjects(formData, "projectRoles").map((item) => ({
    sourceName: item.sourceName || item.projectName || "",
    projectName: item.projectName || item.sourceName || "",
    discipline: item.discipline || "",
    hierarchyLevel: getHierarchyLevel(item.hierarchyLevel),
    hierarchyLabel: getDefaultHierarchyLabel(item.hierarchyLevel),
    costType: getCostType(item.costType)
  }));

  studies.unshift({
    id: `project-${randomUUID()}`,
    tenantId: session.activeTenant.id,
    name: input.name,
    client: input.client,
    plant: input.plant,
    area: maintenanceArea,
    operationalArea: input.operationalArea || undefined,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    status: "collecting",
    methodologyVersion: "braidotti-pmt-v2.0",
    benchmarkSegment: benchmarkCatalog.some((benchmark) => benchmark.segment === input.benchmarkSegment)
      ? input.benchmarkSegment
      : benchmarkCatalog[0].segment,
    activityCatalogVersion: "braidotti-pmt-v2.0",
    hierarchyCatalogVersion: "braidotti-org-v1.0",
    roleCatalogVersion: "braidotti-roles-v1.0",
    collectionMode: input.collectionMode,
    targetCoverage: input.targetCoverage,
    plannedCollectionDays: input.plannedCollectionDays,
    plannedEmployeeSample: input.plannedEmployeeSample,
    costingMode: input.costingMode,
    teams,
    shifts: shifts.slice(0, input.shifts ?? shifts.length),
    disciplines,
    projectHierarchy,
    projectRoles,
    createdAt: now,
    updatedAt: now
  });

  console.log("audit:pmt.project.created", {
    tenantId: session.activeTenant.id,
    actorUserId: session.user.id,
    input
  });

  revalidatePath("/pmt/projetos");
  redirect("/pmt/projetos");
}

function getIndexedValues(formData: FormData, fieldName: string) {
  return Array.from(formData.entries())
    .filter(([key]) => key.startsWith(`${fieldName}[`))
    .sort(([left], [right]) => left.localeCompare(right, "pt-BR", { numeric: true }))
    .map(([, value]) => String(value).trim())
    .filter(Boolean);
}

function uniqueValues(values: string[]) {
  const seen = new Set<string>();

  return values.filter((value) => {
    const key = value.toLocaleLowerCase("pt-BR");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getIndexedObjects(formData: FormData, fieldName: string) {
  const rows = new Map<number, Record<string, string>>();

  for (const [key, value] of formData.entries()) {
    const match = key.match(new RegExp(`^${fieldName}\\[(\\d+)\\]\\[(.+)\\]$`));
    if (!match) continue;

    const index = Number(match[1]);
    const property = match[2];
    rows.set(index, {
      ...(rows.get(index) ?? {}),
      [property]: String(value).trim()
    });
  }

  return Array.from(rows.entries())
    .sort(([left], [right]) => left - right)
    .map(([, item]) => item)
    .filter((item) => Object.values(item).some(Boolean));
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
    L2: "Gestor",
    L3: "Supervisor",
    L4: "Técnico",
    L5: "Operador",
    L6: "Apoio"
  };

  return labels[value ?? ""] ?? "Técnico";
}

function getCostType(value?: string): EmployeeCostType {
  return value === "indirect" ? "indirect" : "direct";
}
