"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission } from "@/core/auth/session";
import { dailyReportEntries, dailyReports, employees, studies } from "@/features/pmt/repositories/mock-data";
import { getActivityCode } from "@/features/pmt/services/activity-codes";

const dailyReportSchema = z.object({
  studyId: z.string().trim().min(1),
  employeeId: z.string().trim().min(1),
  reportDate: z.string().trim().date(),
  shift: z.string().trim().min(1).max(40),
  intent: z.enum(["draft", "submit"])
});

const entrySchema = z.object({
  startTime: z.string().trim().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().trim().regex(/^\d{2}:\d{2}$/),
  workOrder: z.string().trim().min(1).max(80),
  activityCode: z.coerce.number().int().min(0).max(999).refine((code) => Boolean(getActivityCode(code)), "Código BTT inválido."),
  note: z.string().trim().max(240).optional()
});

export async function createDailyReportAction(formData: FormData) {
  const session = await requirePermission("pmt.daily_reports.create");
  const input = dailyReportSchema.parse(Object.fromEntries(formData));
  const now = new Date().toISOString();
  const reportId = `dr-${randomUUID()}`;
  const entriesInput = getEntryInputs(formData);
  const study = studies.find((item) => item.tenantId === session.activeTenant.id && item.id === input.studyId && item.status !== "archived");
  const employee = employees.find((item) => item.tenantId === session.activeTenant.id && item.id === input.employeeId && item.status === "active");

  if (!study) {
    throw new Error("Projeto não encontrado ou arquivado.");
  }
  if (!employee) {
    throw new Error("Funcionário ativo não encontrado.");
  }
  if (study.shifts?.length && !study.shifts.includes(input.shift)) {
    throw new Error("Turno não pertence ao cadastro de turnos do projeto.");
  }
  if (input.reportDate < study.periodStart || input.reportDate > study.periodEnd) {
    throw new Error("Data do diário fora do período do projeto.");
  }
  if (entriesInput.length === 0) {
    throw new Error("Informe pelo menos uma atividade.");
  }

  const entries = entriesInput.map((entry, index) => ({
    id: `dre-${randomUUID()}`,
    tenantId: session.activeTenant.id,
    dailyReportId: reportId,
    sequence: index + 1,
    startTime: entry.startTime,
    endTime: entry.endTime,
    durationSeconds: getDurationSeconds(entry.startTime, entry.endTime),
    workOrder: entry.workOrder,
    activityCode: entry.activityCode,
    note: entry.note
  }));
  dailyReports.unshift({
    id: reportId,
    tenantId: session.activeTenant.id,
    studyId: input.studyId,
    employeeId: input.employeeId,
    reportDate: input.reportDate,
    shift: input.shift,
    totalReportedSeconds: entries.reduce((sum, entry) => sum + entry.durationSeconds, 0),
    status: input.intent === "submit" ? "submitted" : "draft",
    submittedAt: input.intent === "submit" ? now : undefined
  });
  dailyReportEntries.push(...entries);

  console.log("audit:pmt.daily_report.created", {
    tenantId: session.activeTenant.id,
    actorUserId: session.user.id,
    status: input.intent === "submit" ? "submitted" : "draft",
    input
  });

  revalidatePath("/pmt/diarios");
  revalidatePath("/pmt/validacao");
  redirect("/pmt/diarios");
}

function getEntryInputs(formData: FormData) {
  const sequences = Array.from(formData.keys())
    .map((key) => key.match(/^startTime(\d+)$/)?.[1])
    .filter((value): value is string => Boolean(value))
    .map(Number)
    .sort((a, b) => a - b);

  return sequences.flatMap((sequence, index) => {
    const startTime = String(formData.get(`startTime${sequence}`) ?? "").trim();
    const endTime = String(formData.get(`endTime${sequence}`) ?? "").trim();
    const workOrder = String(formData.get(`workOrder${sequence}`) ?? "").trim();
    const activityCode = String(formData.get(`activityCode${sequence}`) ?? "").trim();
    const note = String(formData.get(`note${sequence}`) ?? "").trim();
    const values = [startTime, endTime, workOrder, activityCode, note].filter(Boolean);

    if (values.length === 0) return [];
    if (!startTime || !endTime || !workOrder || !activityCode) {
      throw new Error(`Atividade ${index + 1} está incompleta.`);
    }

    const parsed = entrySchema.parse({
      startTime,
      endTime,
      workOrder,
      activityCode,
      note: note || undefined
    });
    const durationSeconds = getDurationSeconds(parsed.startTime, parsed.endTime);
    if (durationSeconds > 16 * 60 * 60) {
      throw new Error(`Atividade ${index + 1} excede 16 horas.`);
    }

    return [parsed];
  });
}

function getDurationSeconds(startTime: string, endTime: string) {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const start = startHour * 60 + startMinute;
  let end = endHour * 60 + endMinute;

  if (end <= start) end += 24 * 60;

  return (end - start) * 60;
}
