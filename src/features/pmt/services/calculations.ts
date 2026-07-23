import { createHash } from "crypto";
import { activityCodes } from "@/features/pmt/services/activity-codes";
import type { CalculationResult, PmtDailyReportEntry, PmtObservation, PmtStudy } from "@/features/pmt/types";

const ALGORITHM_VERSION = "pmt-fp-2026.07";

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

export function getFatiguePercent(aPercent: number) {
  if (aPercent < 25) return 6;
  if (aPercent < 35) return 8;
  if (aPercent < 45) return 10;
  if (aPercent < 55) return 12;
  return 14;
}

export function calculateStudy(study: PmtStudy, rows: PmtObservation[]): CalculationResult {
  const approved = rows.filter((row) => row.studyId === study.id && row.status === "approved");
  const totalSeconds = approved.reduce((sum, row) => sum + row.durationSeconds, 0);
  const productiveCodes = new Set(activityCodes.filter((item) => item.group === "productive").map((item) => item.code));
  const productiveSeconds = approved
    .filter((row) => productiveCodes.has(row.activityCode))
    .reduce((sum, row) => sum + row.durationSeconds, 0);
  const aPercent = totalSeconds > 0 ? (100 * productiveSeconds) / totalSeconds : 0;
  const travelSeconds = approved.filter((row) => row.activityCode === 120).reduce((sum, row) => sum + row.durationSeconds, 0);
  const travelPercent = totalSeconds > 0 ? (100 * travelSeconds) / totalSeconds : 0;
  const fatiguePercent = getFatiguePercent(aPercent);
  const fpPercent = (aPercent + 0.075 * aPercent + travelPercent) * (1 + fatiguePercent / 100);
  const coveragePercent = Math.min(100, (approved.length / 8) * study.targetCoverage);
  const snapshotHash = createHash("sha256")
    .update(JSON.stringify({ studyId: study.id, approved, algorithmVersion: ALGORITHM_VERSION }))
    .digest("hex")
    .slice(0, 16);

  return {
    studyId: study.id,
    totalSeconds,
    productiveSeconds,
    aPercent: round1(aPercent),
    travelPercent: round1(travelPercent),
    fatiguePercent: round1(fatiguePercent),
    fpPercent: round1(fpPercent),
    coveragePercent: round1(coveragePercent),
    snapshotHash,
    algorithmVersion: ALGORITHM_VERSION
  };
}

export function calculateStudyFromDailyEntries(
  study: PmtStudy,
  entries: PmtDailyReportEntry[],
  validatedReportCount: number
): CalculationResult {
  const totalSeconds = entries.reduce((sum, row) => sum + row.durationSeconds, 0);
  const productiveCodes = new Set(activityCodes.filter((item) => item.group === "productive").map((item) => item.code));
  const productiveSeconds = entries
    .filter((row) => productiveCodes.has(row.activityCode))
    .reduce((sum, row) => sum + row.durationSeconds, 0);
  const aPercent = totalSeconds > 0 ? (100 * productiveSeconds) / totalSeconds : 0;
  const travelSeconds = entries.filter((row) => row.activityCode === 120).reduce((sum, row) => sum + row.durationSeconds, 0);
  const travelPercent = totalSeconds > 0 ? (100 * travelSeconds) / totalSeconds : 0;
  const fatiguePercent = getFatiguePercent(aPercent);
  const fpPercent = (aPercent + 0.075 * aPercent + travelPercent) * (1 + fatiguePercent / 100);
  const coveragePercent = Math.min(100, (validatedReportCount / 8) * study.targetCoverage);
  const snapshotHash = createHash("sha256")
    .update(JSON.stringify({ studyId: study.id, entries, algorithmVersion: ALGORITHM_VERSION }))
    .digest("hex")
    .slice(0, 16);

  return {
    studyId: study.id,
    totalSeconds,
    productiveSeconds,
    aPercent: round1(aPercent),
    travelPercent: round1(travelPercent),
    fatiguePercent: round1(fatiguePercent),
    fpPercent: round1(fpPercent),
    coveragePercent: round1(coveragePercent),
    snapshotHash,
    algorithmVersion: ALGORITHM_VERSION
  };
}

export function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}
