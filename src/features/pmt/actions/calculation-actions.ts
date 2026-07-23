"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission } from "@/core/auth/session";
import { calculationRuns, dailyReportEntries, dailyReports, studies } from "@/features/pmt/repositories/mock-data";
import { calculateStudyFromDailyEntries } from "@/features/pmt/services/calculations";

const calculationSchema = z.object({
  studyId: z.string().trim().min(1),
  intent: z.enum(["draft", "approve", "publish"])
});

export async function runCalculationAction(formData: FormData) {
  const session = await requirePermission("pmt.calculations.run");
  const input = calculationSchema.parse(Object.fromEntries(formData));
  const study = studies.find((item) => item.tenantId === session.activeTenant.id && item.id === input.studyId);

  if (!study) throw new Error("Projeto não encontrado.");

  const validatedReports = dailyReports.filter(
    (report) => report.tenantId === session.activeTenant.id && report.studyId === input.studyId && report.status === "validated"
  );
  const validatedReportIds = new Set(validatedReports.map((report) => report.id));
  const entries = dailyReportEntries.filter((entry) => entry.tenantId === session.activeTenant.id && validatedReportIds.has(entry.dailyReportId));

  if (validatedReports.length === 0 || entries.length === 0) {
    throw new Error("Valide pelo menos um diário com itens antes de calcular.");
  }

  const result = calculateStudyFromDailyEntries(study, entries, validatedReports.length);
  const now = new Date().toISOString();

  calculationRuns.unshift({
    ...result,
    id: `calc-${randomUUID()}`,
    tenantId: session.activeTenant.id,
    status: input.intent === "publish" ? "published" : input.intent === "approve" ? "approved" : "draft",
    methodologyVersion: study.methodologyVersion,
    validatedReportCount: validatedReports.length,
    entryCount: entries.length,
    createdAt: now,
    createdBy: session.user.name,
    publishedAt: input.intent === "publish" ? now : undefined
  });

  console.log("audit:pmt.calculation.run", {
    tenantId: session.activeTenant.id,
    actorUserId: session.user.id,
    input,
    snapshotHash: result.snapshotHash,
    validatedReportCount: validatedReports.length,
    entryCount: entries.length,
    algorithmVersion: result.algorithmVersion
  });

  revalidatePath("/pmt/calculos");
  revalidatePath("/pmt/analises");
  revalidatePath(`/pmt/${input.studyId}`);
  redirect("/pmt/calculos");
}
