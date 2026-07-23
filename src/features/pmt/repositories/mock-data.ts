import type { PmtAction, PmtCalculationRun, PmtDailyReport, PmtDailyReportEntry, PmtEmployee, PmtObservation, PmtStudy } from "@/features/pmt/types";

export const CLIENTE_GERDAU_TENANT_ID = "5e78e5fc-3482-4102-9bd4-f6fbe7035ef1";
export const CLIENTE_ENEVA_TENANT_ID = "8f8ce7d2-2b0e-4d21-bd44-cf8d930e1e22";

export const projectMemberships = [
  {
    id: "pm-braidotti-gerdau",
    tenantId: CLIENTE_GERDAU_TENANT_ID,
    projectId: "study-gerdau-jul-2026",
    userId: "7f40e2c9-8af0-4d47-b8b5-45f2f98f1a21",
    roleCode: "super_admin_braidotti",
    status: "active" as const
  },
  {
    id: "pm-braidotti-eneva",
    tenantId: CLIENTE_ENEVA_TENANT_ID,
    projectId: "study-eneva-jun-2026",
    userId: "7f40e2c9-8af0-4d47-b8b5-45f2f98f1a21",
    roleCode: "super_admin_braidotti",
    status: "active" as const
  }
];

export const studies: PmtStudy[] = [
  {
    id: "study-gerdau-jul-2026",
    tenantId: CLIENTE_GERDAU_TENANT_ID,
    name: "BTT Gerdau - Linha de Acabamento",
    client: "Gerdau",
    plant: "Usina Ouro Branco",
    area: "Laminação",
    periodStart: "2026-07-01",
    periodEnd: "2026-07-12",
    status: "validation",
    methodologyVersion: "braidotti-pmt-v2.0",
    benchmarkSegment: "Manutenção industrial contínua",
    activityCatalogVersion: "braidotti-pmt-v2.0",
    hierarchyCatalogVersion: "braidotti-org-v1.0",
    roleCatalogVersion: "braidotti-roles-v1.0",
    collectionMode: "hybrid",
    targetCoverage: 85,
    createdAt: "2026-07-01T12:00:00Z",
    updatedAt: "2026-07-14T20:00:00Z"
  },
  {
    id: "study-eneva-jun-2026",
    tenantId: CLIENTE_ENEVA_TENANT_ID,
    name: "BTT Eneva - Manutenção Térmica",
    client: "Eneva",
    plant: "Parnaíba",
    area: "Caldeiras",
    periodStart: "2026-06-03",
    periodEnd: "2026-06-18",
    status: "published",
    methodologyVersion: "braidotti-pmt-v2.0",
    benchmarkSegment: "Manutenção industrial contínua",
    activityCatalogVersion: "braidotti-pmt-v2.0",
    hierarchyCatalogVersion: "braidotti-org-v1.0",
    roleCatalogVersion: "braidotti-roles-v1.0",
    collectionMode: "self_report",
    targetCoverage: 90,
    createdAt: "2026-06-01T12:00:00Z",
    updatedAt: "2026-06-22T20:00:00Z"
  }
];

export const observations: PmtObservation[] = [
  { id: "obs-1", tenantId: studies[0].tenantId, studyId: studies[0].id, observedAt: "2026-07-08T11:00:00Z", timezone: "America/Sao_Paulo", observer: "Amanda", collaboratorCode: "MEC-014", team: "Equipe A", shift: "Diurno", discipline: "Mecânica", workOrder: "OS-98231", activityCode: 100, durationSeconds: 1620, status: "approved" },
  { id: "obs-2", tenantId: studies[0].tenantId, studyId: studies[0].id, observedAt: "2026-07-08T11:27:00Z", timezone: "America/Sao_Paulo", observer: "Amanda", collaboratorCode: "MEC-014", team: "Equipe A", shift: "Diurno", discipline: "Mecânica", workOrder: "OS-98231", activityCode: 120, durationSeconds: 540, status: "approved" },
  { id: "obs-3", tenantId: studies[0].tenantId, studyId: studies[0].id, observedAt: "2026-07-08T11:36:00Z", timezone: "America/Sao_Paulo", observer: "Bruno", collaboratorCode: "ELE-008", team: "Equipe B", shift: "Diurno", discipline: "Elétrica", workOrder: "OS-98240", activityCode: 140, durationSeconds: 900, status: "approved", note: "Material não disponível no almoxarifado." },
  { id: "obs-4", tenantId: studies[0].tenantId, studyId: studies[0].id, observedAt: "2026-07-08T12:10:00Z", timezone: "America/Sao_Paulo", observer: "Bruno", collaboratorCode: "ELE-008", team: "Equipe B", shift: "Diurno", discipline: "Elétrica", workOrder: "OS-98240", activityCode: 100, durationSeconds: 1320, status: "approved" },
  { id: "obs-5", tenantId: studies[0].tenantId, studyId: studies[0].id, observedAt: "2026-07-08T12:32:00Z", timezone: "America/Sao_Paulo", observer: "Amanda", collaboratorCode: "MEC-014", team: "Equipe A", shift: "Diurno", discipline: "Mecânica", workOrder: "OS-98231", activityCode: 170, durationSeconds: 420, status: "pending" },
  { id: "obs-6", tenantId: studies[1].tenantId, studyId: studies[1].id, observedAt: "2026-06-10T14:00:00Z", timezone: "America/Sao_Paulo", observer: "Carla", collaboratorCode: "CAL-022", team: "Equipe C", shift: "Noturno", discipline: "Caldeiraria", workOrder: "OS-77111", activityCode: 100, durationSeconds: 1880, status: "approved" },
  { id: "obs-7", tenantId: studies[1].tenantId, studyId: studies[1].id, observedAt: "2026-06-10T14:32:00Z", timezone: "America/Sao_Paulo", observer: "Carla", collaboratorCode: "CAL-022", team: "Equipe C", shift: "Noturno", discipline: "Caldeiraria", workOrder: "OS-77111", activityCode: 150, durationSeconds: 620, status: "approved" }
];

export const employees: PmtEmployee[] = [
  {
    id: "emp-mec-014",
    tenantId: studies[0].tenantId,
    employeeCode: "MEC-014",
    fullName: "João Pereira",
    email: "joao.pereira@cliente.dev",
    companyUnit: "Usina Ouro Branco",
    maintenanceArea: "Laminação",
    team: "Equipe A",
    shift: "Diurno",
    discipline: "Mecânica",
    role: "Mecânico mantenedor",
    hierarchyLevel: "L4",
    hierarchyLabel: "Mecânico",
    costType: "direct",
    hourlyCost: 86,
    status: "inactive",
    canSelfReport: true,
    createdAt: "2026-07-01T12:00:00Z",
    updatedAt: "2026-07-01T12:00:00Z"
  },
  {
    id: "emp-ele-008",
    tenantId: studies[0].tenantId,
    employeeCode: "ELE-008",
    fullName: "Mariana Souza",
    email: "mariana.souza@cliente.dev",
    companyUnit: "Usina Ouro Branco",
    maintenanceArea: "Laminação",
    team: "Equipe B",
    shift: "Diurno",
    discipline: "Elétrica",
    role: "Eletricista industrial",
    hierarchyLevel: "L5",
    hierarchyLabel: "Eletricista",
    costType: "direct",
    hourlyCost: 92,
    status: "active",
    canSelfReport: true,
    createdAt: "2026-07-01T12:00:00Z",
    updatedAt: "2026-07-01T12:00:00Z"
  },
  {
    id: "emp-cal-022",
    tenantId: studies[1].tenantId,
    employeeCode: "CAL-022",
    fullName: "Carlos Lima",
    email: "carlos.lima@cliente.dev",
    companyUnit: "Parnaíba",
    maintenanceArea: "Caldeiras",
    team: "Equipe C",
    shift: "Noturno",
    discipline: "Caldeiraria",
    role: "Caldeireiro",
    hierarchyLevel: "L4",
    hierarchyLabel: "Mecânico",
    costType: "direct",
    hourlyCost: 88,
    status: "active",
    canSelfReport: false,
    createdAt: "2026-06-01T12:00:00Z",
    updatedAt: "2026-06-01T12:00:00Z"
  }
];

export const dailyReports: PmtDailyReport[] = [
  { id: "dr-1", tenantId: studies[0].tenantId, studyId: studies[0].id, employeeId: "emp-mec-014", reportDate: "2026-07-08", shift: "Diurno", totalReportedSeconds: 2580, status: "submitted", submittedAt: "2026-07-08T21:00:00Z" },
  { id: "dr-2", tenantId: studies[0].tenantId, studyId: studies[0].id, employeeId: "emp-ele-008", reportDate: "2026-07-08", shift: "Diurno", totalReportedSeconds: 2220, status: "validated", submittedAt: "2026-07-08T21:12:00Z", validatedAt: "2026-07-09T12:00:00Z" },
  { id: "dr-3", tenantId: studies[1].tenantId, studyId: studies[1].id, employeeId: "emp-cal-022", reportDate: "2026-06-10", shift: "Noturno", totalReportedSeconds: 2500, status: "validated", submittedAt: "2026-06-10T23:45:00Z", validatedAt: "2026-06-11T11:00:00Z" }
];

export const dailyReportEntries: PmtDailyReportEntry[] = [
  { id: "dre-1", tenantId: studies[0].tenantId, dailyReportId: "dr-1", sequence: 1, startTime: "07:30", endTime: "08:20", durationSeconds: 3000, workOrder: "OS-98231", activityCode: 110, note: "Preparação e DDS da equipe." },
  { id: "dre-2", tenantId: studies[0].tenantId, dailyReportId: "dr-1", sequence: 2, startTime: "08:20", endTime: "09:15", durationSeconds: 3300, workOrder: "OS-98231", activityCode: 100, note: "Execução em transportador." },
  { id: "dre-3", tenantId: studies[0].tenantId, dailyReportId: "dr-1", sequence: 3, startTime: "09:15", endTime: "09:30", durationSeconds: 900, workOrder: "OS-98231", activityCode: 120 },
  { id: "dre-4", tenantId: studies[0].tenantId, dailyReportId: "dr-2", sequence: 1, startTime: "07:40", endTime: "08:05", durationSeconds: 1500, workOrder: "OS-98240", activityCode: 140, note: "Aguardando componente." },
  { id: "dre-5", tenantId: studies[0].tenantId, dailyReportId: "dr-2", sequence: 2, startTime: "08:05", endTime: "09:10", durationSeconds: 3900, workOrder: "OS-98240", activityCode: 100 },
  { id: "dre-6", tenantId: studies[1].tenantId, dailyReportId: "dr-3", sequence: 1, startTime: "22:00", endTime: "22:45", durationSeconds: 2700, workOrder: "OS-77111", activityCode: 100 },
  { id: "dre-7", tenantId: studies[1].tenantId, dailyReportId: "dr-3", sequence: 2, startTime: "22:45", endTime: "23:05", durationSeconds: 1200, workOrder: "OS-77111", activityCode: 150 }
];

export const actions: PmtAction[] = [
  { id: "act-1", tenantId: studies[0].tenantId, studyId: studies[0].id, title: "Criar kit mínimo de materiais para OS repetitivas", owner: "Planejamento", dueDate: "2026-07-30", status: "in_progress", estimatedBenefitPercent: 4.2 },
  { id: "act-2", tenantId: studies[0].tenantId, studyId: studies[0].id, title: "Revisar fluxo de liberação de área crítica", owner: "Operação", dueDate: "2026-08-05", status: "open", estimatedBenefitPercent: 2.8 },
  { id: "act-3", tenantId: studies[1].tenantId, studyId: studies[1].id, title: "Padronizar suporte de terceiros no turno noturno", owner: "Contrato", dueDate: "2026-07-10", status: "done", estimatedBenefitPercent: 3.5 }
];

export const calculationRuns: PmtCalculationRun[] = [
  {
    id: "calc-eneva-jun-2026-v1",
    tenantId: studies[1].tenantId,
    studyId: studies[1].id,
    status: "published",
    methodologyVersion: "braidotti-pmt-v2.0",
    validatedReportCount: 1,
    entryCount: 2,
    totalSeconds: 3900,
    productiveSeconds: 2700,
    aPercent: 69.2,
    travelPercent: 0,
    fatiguePercent: 14,
    fpPercent: 84.8,
    coveragePercent: 11.3,
    snapshotHash: "eneva-jun-v1",
    algorithmVersion: "pmt-fp-2026.07",
    createdAt: "2026-06-22T20:00:00Z",
    createdBy: "Amanda Kynovia",
    publishedAt: "2026-06-22T21:00:00Z"
  }
];
