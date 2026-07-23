"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission } from "@/core/auth/session";
import { dailyReportEntries, dailyReports } from "@/features/pmt/repositories/mock-data";

const VALIDATION_RULES = {
  dailyAssignableSeconds: 8 * 60 * 60,
  weeklyAssignableSeconds: 40 * 60 * 60,
  complementActivityCode: 10
};

const validationSchema = z.object({
  reportId: z.string().trim().min(1),
  note: z.string().trim().max(400).optional()
});

const batchValidationSchema = z.object({
  reportIds: z.array(z.string().trim().min(1)).min(1).max(500).transform((ids) => Array.from(new Set(ids)))
});

const reclassificationSchema = z.object({
  reportId: z.string().trim().min(1),
  entryId: z.string().trim().min(1),
  activityCode: z.coerce.number().int().min(0).max(999),
  justification: z.string().trim().min(8).max(400)
});

export async function validateDailyReportAction(formData: FormData) {
  const session = await requirePermission("pmt.daily_reports.validate");
  const input = validationSchema.parse(Object.fromEntries(formData));
  const report = dailyReports.find((item) => item.tenantId === session.activeTenant.id && item.id === input.reportId);

  if (!report) throw new Error("Diário não encontrado.");
  if (report.status !== "submitted") throw new Error("Apenas diários recebidos podem ser aprovados.");

  report.status = "validated";
  report.validatedAt = new Date().toISOString();
  report.validationNote = input.note;

  console.log("audit:pmt.daily_report.validated", {
    tenantId: session.activeTenant.id,
    actorUserId: session.user.id,
    input
  });

  revalidatePath("/pmt/validacao");
  revalidatePath("/pmt/diarios");
  revalidatePath("/pmt/calculos");
  revalidatePath("/pmt/analises");
  revalidatePath(`/pmt/diarios/${input.reportId}`);
  redirect("/pmt/validacao");
}

export async function approveDailyReportsAction(formData: FormData) {
  const session = await requirePermission("pmt.daily_reports.validate");
  const input = batchValidationSchema.parse({ reportIds: formData.getAll("reportIds") });
  const now = new Date().toISOString();
  const reports = getSubmittedReportsOrThrow(session.activeTenant.id, input.reportIds);

  reports.forEach((report) => {
    report.status = "validated";
    report.validatedAt = now;
    report.validationNote = "Aprovado em lote.";
  });

  console.log("audit:pmt.daily_reports.batch_approved", {
    tenantId: session.activeTenant.id,
    actorUserId: session.user.id,
    reportIds: reports.map((report) => report.id)
  });

  revalidateValidationWorkspace();
}

export async function rejectDailyReportsAction(formData: FormData) {
  const session = await requirePermission("pmt.daily_reports.validate");
  const input = batchValidationSchema.parse({ reportIds: formData.getAll("reportIds") });
  const reports = getSubmittedReportsOrThrow(session.activeTenant.id, input.reportIds);

  reports.forEach((report) => {
    report.status = "rejected";
    report.validationNote = "Reprovado em lote.";
  });

  console.log("audit:pmt.daily_reports.batch_rejected", {
    tenantId: session.activeTenant.id,
    actorUserId: session.user.id,
    reportIds: reports.map((report) => report.id)
  });

  revalidateValidationWorkspace();
}

export async function normalizeDailyReportsAction(formData: FormData) {
  const session = await requirePermission("pmt.daily_reports.validate");
  const input = batchValidationSchema.parse({ reportIds: formData.getAll("reportIds") });
  const reports = getSubmittedReportsOrThrow(session.activeTenant.id, input.reportIds);
  let normalizedCount = 0;

  reports.forEach((report) => {
    const entries = dailyReportEntries
      .filter((entry) => entry.tenantId === session.activeTenant.id && entry.dailyReportId === report.id)
      .sort((a, b) => a.sequence - b.sequence);
    const currentSeconds = entries.reduce((sum, entry) => sum + entry.durationSeconds, 0);
    const missingSeconds = VALIDATION_RULES.dailyAssignableSeconds - currentSeconds;
    const alreadyNormalized = entries.some(
      (entry) => entry.workOrder === "NORMALIZACAO-BTT" && entry.activityCode === VALIDATION_RULES.complementActivityCode
    );

    if (missingSeconds <= 0 || alreadyNormalized) return;

    const lastEntry = entries.at(-1);
    const nextSequence = (lastEntry?.sequence ?? 0) + 1;
    const startTime = lastEntry?.endTime ?? "00:00";
    const endTime = addSecondsToTime(startTime, missingSeconds);

    dailyReportEntries.push({
      id: `dre-normalized-${randomUUID()}`,
      tenantId: session.activeTenant.id,
      dailyReportId: report.id,
      sequence: nextSequence,
      startTime,
      endTime,
      durationSeconds: missingSeconds,
      workOrder: "NORMALIZACAO-BTT",
      activityCode: VALIDATION_RULES.complementActivityCode,
      note: "Complemento automático pela regra global de validação."
    });

    report.totalReportedSeconds = currentSeconds + missingSeconds;
    normalizedCount += 1;
  });

  console.log("audit:pmt.daily_reports.normalized", {
    tenantId: session.activeTenant.id,
    actorUserId: session.user.id,
    reportIds: reports.map((report) => report.id),
    normalizedCount,
    rules: VALIDATION_RULES
  });

  revalidateValidationWorkspace();
}

export async function rejectDailyReportAction(formData: FormData) {
  const session = await requirePermission("pmt.daily_reports.validate");
  const input = validationSchema.extend({ note: z.string().trim().min(8).max(400) }).parse(Object.fromEntries(formData));
  const report = dailyReports.find((item) => item.tenantId === session.activeTenant.id && item.id === input.reportId);

  if (!report) throw new Error("Diário não encontrado.");
  if (report.status !== "submitted") throw new Error("Apenas diários recebidos podem ser reprovados.");

  report.status = "rejected";
  report.validationNote = input.note;

  console.log("audit:pmt.daily_report.rejected", {
    tenantId: session.activeTenant.id,
    actorUserId: session.user.id,
    input
  });

  revalidatePath("/pmt/validacao");
  revalidatePath("/pmt/diarios");
  revalidatePath(`/pmt/diarios/${input.reportId}`);
  redirect("/pmt/validacao");
}

export async function reclassifyDailyReportEntryAction(formData: FormData) {
  const session = await requirePermission("pmt.daily_reports.validate");
  const input = reclassificationSchema.parse(Object.fromEntries(formData));
  const entry = dailyReportEntries.find((item) => item.tenantId === session.activeTenant.id && item.id === input.entryId);
  const report = dailyReports.find((item) => item.tenantId === session.activeTenant.id && item.id === input.reportId);

  if (!report) throw new Error("Diário não encontrado.");
  if (!entry) throw new Error("Item do diário não encontrado.");
  if (entry.dailyReportId !== report.id) throw new Error("Item não pertence ao diário informado.");
  if (report.status === "validated") throw new Error("Diário validado não pode ser reclassificado sem reabrir validação.");

  entry.activityCode = input.activityCode;
  entry.note = entry.note ? `${entry.note} Reclassificação: ${input.justification}` : `Reclassificação: ${input.justification}`;

  console.log("audit:pmt.daily_report_entry.reclassified", {
    tenantId: session.activeTenant.id,
    actorUserId: session.user.id,
    input
  });

  revalidatePath(`/pmt/validacao/${input.reportId}`);
  revalidatePath(`/pmt/diarios/${input.reportId}`);
  revalidatePath("/pmt/calculos");
  revalidatePath("/pmt/analises");
  redirect(`/pmt/validacao/${input.reportId}`);
}

function revalidateValidationWorkspace() {
  revalidatePath("/pmt/validacao");
  revalidatePath("/pmt/diarios");
  revalidatePath("/pmt/calculos");
  revalidatePath("/pmt/analises");
}

function getSubmittedReportsOrThrow(tenantId: string, reportIds: string[]) {
  const reports = dailyReports.filter((item) => tenantId === item.tenantId && reportIds.includes(item.id));

  if (reports.length !== reportIds.length) {
    throw new Error("Um ou mais diários selecionados não foram encontrados.");
  }
  if (reports.some((report) => report.status !== "submitted")) {
    throw new Error("Ações em lote só podem ser aplicadas a diários recebidos.");
  }

  return reports;
}

function addSecondsToTime(time: string, seconds: number) {
  const [hours = "0", minutes = "0"] = time.split(":");
  const totalMinutes = Number(hours) * 60 + Number(minutes) + Math.round(seconds / 60);
  const nextHours = Math.floor(totalMinutes / 60) % 24;
  const nextMinutes = totalMinutes % 60;

  return `${String(nextHours).padStart(2, "0")}:${String(nextMinutes).padStart(2, "0")}`;
}
