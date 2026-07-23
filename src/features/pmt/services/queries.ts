import { actions, calculationRuns, dailyReportEntries, dailyReports, employees, observations, studies } from "@/features/pmt/repositories/mock-data";
import { calculateStudy, calculateStudyFromDailyEntries, formatDuration } from "@/features/pmt/services/calculations";
import { getActivityCode } from "@/features/pmt/services/activity-codes";
import { hierarchyCatalog, roleCatalog } from "@/features/pmt/services/system-catalogs";
import type { EmployeeRegistryOptions } from "@/features/pmt/types";

export async function listStudies(tenantId: string) {
  return studies.filter((study) => study.tenantId === tenantId);
}

export async function getStudy(tenantId: string, studyId: string) {
  return studies.find((study) => study.tenantId === tenantId && study.id === studyId) ?? null;
}

export async function getStudyWorkspace(tenantId: string, studyId: string) {
  const study = await getStudy(tenantId, studyId);
  if (!study) return null;

  const studyObservations = observations.filter((row) => row.tenantId === tenantId && row.studyId === studyId);
  const studyActions = actions.filter((row) => row.tenantId === tenantId && row.studyId === studyId);
  const result = calculateStudy(study, studyObservations);

  return { study, observations: studyObservations, actions: studyActions, result };
}

export async function getDashboard(tenantId: string) {
  const tenantStudies = await listStudies(tenantId);
  const workspaces = tenantStudies.map((study) => {
    const studyObservations = observations.filter((row) => row.tenantId === tenantId && row.studyId === study.id);
    const studyActions = actions.filter((row) => row.tenantId === tenantId && row.studyId === study.id);
    return { study, result: calculateStudy(study, studyObservations), observations: studyObservations, actions: studyActions };
  });
  const approved = observations.filter((row) => row.tenantId === tenantId && row.status === "approved");
  const losses = approved
    .filter((row) => getActivityCode(row.activityCode)?.group === "loss")
    .reduce<Record<number, number>>((acc, row) => {
      acc[row.activityCode] = (acc[row.activityCode] ?? 0) + row.durationSeconds;
      return acc;
    }, {});
  const pareto = Object.entries(losses)
    .map(([code, seconds]) => ({ code: Number(code), label: getActivityCode(Number(code))?.label ?? code, seconds }))
    .sort((a, b) => b.seconds - a.seconds);

  return {
    studies: tenantStudies,
    workspaces,
    pareto,
    openActions: actions.filter((row) => row.tenantId === tenantId && row.status !== "done").length,
    pendingObservations: observations.filter((row) => row.tenantId === tenantId && row.status === "pending").length,
    activeEmployees: employees.filter((row) => row.tenantId === tenantId && row.status === "active").length,
    submittedDailyReports: dailyReports.filter((row) => row.tenantId === tenantId && row.status === "submitted").length,
    draftDailyReports: dailyReports.filter((row) => row.tenantId === tenantId && row.status === "draft").length
  };
}

export async function listEmployees(tenantId: string) {
  return employees.filter((employee) => employee.tenantId === tenantId);
}

export async function listDailyReports(tenantId: string) {
  return dailyReports
    .filter((report) => report.tenantId === tenantId)
    .map((report) => {
      const employee = employees.find((item) => item.id === report.employeeId);
      const study = studies.find((item) => item.id === report.studyId);
      const entries = dailyReportEntries.filter((entry) => entry.tenantId === tenantId && entry.dailyReportId === report.id);

      return { report, employee, study, entries };
    })
    .sort((a, b) => b.report.reportDate.localeCompare(a.report.reportDate));
}

export async function getDailyReportWorkspace(tenantId: string, reportId: string) {
  const report = dailyReports.find((item) => item.tenantId === tenantId && item.id === reportId);
  if (!report) return null;

  const employee = employees.find((item) => item.tenantId === tenantId && item.id === report.employeeId) ?? null;
  const study = studies.find((item) => item.tenantId === tenantId && item.id === report.studyId) ?? null;
  const entries = dailyReportEntries
    .filter((entry) => entry.tenantId === tenantId && entry.dailyReportId === reportId)
    .sort((a, b) => a.sequence - b.sequence);

  return { report, employee, study, entries };
}

export async function getDailyReportFormOptions(tenantId: string) {
  return {
    employees: employees.filter((employee) => employee.tenantId === tenantId && employee.status === "active"),
    studies: studies.filter((study) => study.tenantId === tenantId && study.status !== "archived"),
    shiftsByStudy: Object.fromEntries(
      studies
        .filter((study) => study.tenantId === tenantId && study.status !== "archived")
        .map((study) => [
          study.id,
          study.shifts && study.shifts.length > 0
            ? study.shifts
            : uniqueValues(employees.filter((employee) => employee.tenantId === tenantId && employee.companyUnit === study.plant).map((employee) => employee.shift))
        ])
    )
  };
}

function getDailyReportQualityFlags(entries: typeof dailyReportEntries) {
  const flags: string[] = [];

  if (entries.length === 0) flags.push("Sem atividades apontadas");
  if (entries.some((entry) => !getActivityCode(entry.activityCode))) flags.push("Código BTT inválido");
  if (entries.some((entry) => entry.durationSeconds <= 0)) flags.push("Duração inválida");
  if (entries.some((entry) => !entry.workOrder)) flags.push("OS/serviço ausente");

  const totalSeconds = entries.reduce((sum, entry) => sum + entry.durationSeconds, 0);
  if (totalSeconds > 12 * 60 * 60) flags.push("Tempo acima de 12h");
  if (totalSeconds < 2 * 60 * 60) flags.push("Tempo abaixo do esperado");

  return flags;
}

export async function getValidationQueue(tenantId: string) {
  const reports = await listDailyReports(tenantId);
  const queue = reports
    .filter(({ report }) => report.status === "submitted")
    .map((item) => ({
      ...item,
      qualityFlags: getDailyReportQualityFlags(item.entries),
      totalDuration: formatDuration(item.entries.reduce((sum, entry) => sum + entry.durationSeconds, 0))
    }));

  return {
    queue,
    submittedCount: queue.filter(({ report }) => report.status === "submitted").length,
    rejectedCount: reports.filter(({ report }) => report.status === "rejected").length,
    flaggedCount: queue.filter((item) => item.qualityFlags.length > 0).length
  };
}

export async function getEmployeeInputsSummary(tenantId: string) {
  const tenantEmployees = employees.filter((employee) => employee.tenantId === tenantId);
  const tenantReports = dailyReports.filter((report) => report.tenantId === tenantId);
  const options = getEmployeeRegistryOptions(tenantId);
  const hierarchySummary = tenantEmployees.reduce<Record<string, {
    count: number;
    directCount: number;
    indirectCount: number;
    selfReportCount: number;
    totalHourlyCost: number;
  }>>((acc, employee) => {
    const item = acc[employee.hierarchyLevel] ?? {
      count: 0,
      directCount: 0,
      indirectCount: 0,
      selfReportCount: 0,
      totalHourlyCost: 0
    };

    item.count += 1;
    item.totalHourlyCost += employee.hourlyCost;
    if (employee.costType === "direct") item.directCount += 1;
    if (employee.costType === "indirect") item.indirectCount += 1;
    if (employee.canSelfReport) item.selfReportCount += 1;
    acc[employee.hierarchyLevel] = item;

    return acc;
  }, {});

  return {
    employees: tenantEmployees,
    options,
    reports: tenantReports,
    activeCount: tenantEmployees.filter((employee) => employee.status === "active").length,
    directCostCount: tenantEmployees.filter((employee) => employee.costType === "direct").length,
    indirectCostCount: tenantEmployees.filter((employee) => employee.costType === "indirect").length,
    averageHourlyCost: tenantEmployees.length > 0
      ? tenantEmployees.reduce((sum, employee) => sum + employee.hourlyCost, 0) / tenantEmployees.length
      : 0,
    selfReportCount: tenantEmployees.filter((employee) => employee.canSelfReport).length,
    submittedCount: tenantReports.filter((report) => report.status === "submitted").length,
    validatedCount: tenantReports.filter((report) => report.status === "validated").length,
    hierarchySummary: Object.entries(hierarchySummary)
      .map(([level, item]) => ({
        level,
        ...item,
        averageHourlyCost: item.count > 0 ? item.totalHourlyCost / item.count : 0
      }))
      .sort((a, b) => a.level.localeCompare(b.level))
  };
}

function getEmployeeRegistryOptions(tenantId: string): EmployeeRegistryOptions {
  const tenantEmployees = employees.filter((employee) => employee.tenantId === tenantId);
  const tenantStudies = studies.filter((study) => study.tenantId === tenantId && study.status !== "archived");
  const projectRoles = tenantStudies.flatMap((study) => study.projectRoles ?? []);
  const projectHierarchy = tenantStudies.flatMap((study) => study.projectHierarchy ?? []);

  const roles = [
    ...projectRoles.map((role) => ({
      name: role.projectName,
      discipline: role.discipline,
      hierarchyLevel: role.hierarchyLevel,
      hierarchyLabel: role.hierarchyLabel,
      costType: role.costType
    })),
    ...roleCatalog.map((role) => ({
      name: role.name,
      discipline: role.discipline,
      hierarchyLevel: role.defaultHierarchyLevel,
      hierarchyLabel: hierarchyCatalog.find((item) => item.level === role.defaultHierarchyLevel)?.label ?? role.defaultHierarchyLevel,
      costType: role.defaultCostType
    })),
    ...tenantEmployees.map((employee) => ({
      name: employee.role,
      discipline: employee.discipline,
      hierarchyLevel: employee.hierarchyLevel,
      hierarchyLabel: employee.hierarchyLabel,
      costType: employee.costType
    }))
  ].filter((role) => role.name);

  return {
    units: uniqueValues([
      ...tenantStudies.map((study) => study.plant),
      ...tenantEmployees.map((employee) => employee.companyUnit)
    ]),
    maintenanceAreas: uniqueValues([
      ...tenantStudies.map((study) => study.area),
      ...tenantStudies.map((study) => study.operationalArea ?? ""),
      ...tenantEmployees.map((employee) => employee.maintenanceArea)
    ]),
    teams: uniqueValues([
      ...tenantStudies.flatMap((study) => study.teams ?? []),
      ...tenantEmployees.map((employee) => employee.team)
    ]),
    shifts: uniqueValues([
      ...tenantStudies.flatMap((study) => study.shifts ?? []),
      ...tenantEmployees.map((employee) => employee.shift)
    ]),
    disciplines: uniqueValues([
      ...tenantStudies.flatMap((study) => study.disciplines ?? []),
      ...projectRoles.map((role) => role.discipline),
      ...roleCatalog.map((role) => role.discipline),
      ...tenantEmployees.map((employee) => employee.discipline)
    ]),
    roles: uniqueRoles(roles),
    hierarchyLevels: uniqueHierarchy([
      ...projectHierarchy.map((item) => ({ level: item.level, label: item.label })),
      ...hierarchyCatalog.map((item) => ({ level: item.level, label: item.label })),
      ...tenantEmployees.map((employee) => ({ level: employee.hierarchyLevel, label: employee.hierarchyLabel }))
    ])
  };
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function uniqueRoles(roles: EmployeeRegistryOptions["roles"]) {
  const seen = new Set<string>();
  return roles.filter((role) => {
    const key = `${role.name}|${role.discipline}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function uniqueHierarchy(levels: EmployeeRegistryOptions["hierarchyLevels"]) {
  const seen = new Set<string>();
  return levels.filter((item) => {
    if (seen.has(item.level)) return false;
    seen.add(item.level);
    return true;
  }).sort((a, b) => a.level.localeCompare(b.level));
}

export async function getCalculationWorkspace(tenantId: string) {
  const tenantStudies = studies.filter((study) => study.tenantId === tenantId);

  return tenantStudies.map((study) => {
    const validatedReports = dailyReports.filter(
      (report) => report.tenantId === tenantId && report.studyId === study.id && report.status === "validated"
    );
    const validatedReportIds = new Set(validatedReports.map((report) => report.id));
    const entries = dailyReportEntries.filter((entry) => entry.tenantId === tenantId && validatedReportIds.has(entry.dailyReportId));
    const result = calculateStudyFromDailyEntries(study, entries, validatedReports.length);
    const runs = calculationRuns.filter((run) => run.tenantId === tenantId && run.studyId === study.id);
    const latestRun = runs.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;

    return {
      study,
      validatedReports,
      entries,
      result,
      latestRun,
      canCalculate: validatedReports.length > 0 && entries.length > 0
    };
  });
}

export async function getAnalysisWorkspace(tenantId: string) {
  const calculations = await getCalculationWorkspace(tenantId);

  return calculations
    .filter((workspace) => workspace.canCalculate)
    .map((workspace) => {
      const totalSeconds = workspace.entries.reduce((sum, entry) => sum + entry.durationSeconds, 0);
      const byCode = workspace.entries.reduce<Record<number, number>>((acc, entry) => {
        acc[entry.activityCode] = (acc[entry.activityCode] ?? 0) + entry.durationSeconds;
        return acc;
      }, {});
      const distribution = Object.entries(byCode)
        .map(([code, seconds]) => {
          const activity = getActivityCode(Number(code));
          return {
            code: Number(code),
            label: activity?.label ?? code,
            group: activity?.group ?? "loss",
            seconds,
            percent: totalSeconds > 0 ? Math.round((seconds / totalSeconds) * 1000) / 10 : 0
          };
        })
        .sort((a, b) => b.seconds - a.seconds);
      let cumulativePercent = 0;
      const pareto = distribution.map((item) => {
        cumulativePercent = Math.round((cumulativePercent + item.percent) * 10) / 10;

        return {
          ...item,
          cumulativePercent: Math.min(100, cumulativePercent),
          priority: item.group === "loss" && item.percent >= 10 ? "critical" : item.group === "loss" ? "attention" : "monitor"
        };
      });
      const losses = distribution.filter((item) => item.group === "loss");
      const groupTotals = distribution.reduce<Record<string, number>>((acc, item) => {
        acc[item.group] = (acc[item.group] ?? 0) + item.seconds;
        return acc;
      }, {});
      const benchmarkFp = workspace.study.client === "Eneva" ? 92 : 86;
      const fpGap = Math.round((workspace.result.fpPercent - benchmarkFp) * 10) / 10;
      const potentialGain = Math.max(0, Math.round(Math.abs(fpGap) * 0.45 * 10) / 10);
      const lossPercent = totalSeconds > 0 ? Math.round(((groupTotals.loss ?? 0) / totalSeconds) * 1000) / 10 : 0;
      const diagnosis = fpGap >= 0
        ? "Acima do benchmark: preservar práticas e monitorar perdas residuais."
        : lossPercent >= 20
          ? "Abaixo do benchmark com perdas relevantes: priorizar causas de espera, retrabalho e interferências."
          : "Abaixo do benchmark com perdas distribuídas: aprofundar amostra e validar classificação dos códigos.";

      return {
        ...workspace,
        distribution,
        pareto,
        losses,
        groupTotals: {
          productive: groupTotals.productive ?? 0,
          indirect: groupTotals.indirect ?? 0,
          loss: groupTotals.loss ?? 0
        },
        benchmark: {
          label: workspace.study.client === "Eneva" ? "Benchmark térmicas" : "Benchmark fábricas",
          fpPercent: benchmarkFp,
          gapPercent: fpGap,
          potentialGainPercent: potentialGain
        },
        diagnosis,
        lossPercent,
        recommendations: losses.slice(0, 3).map((loss) => ({
          title: `Reduzir ${loss.label.toLowerCase()}`,
          impact: Math.max(1, Math.round(loss.percent * 0.35 * 10) / 10),
          basis: `${loss.percent}% do tempo validado`
        }))
      };
    });
}
