export type PmtStudyStatus = "draft" | "collecting" | "validation" | "published" | "archived";
export type ObservationStatus = "pending" | "approved" | "rejected";
export type ActionStatus = "open" | "in_progress" | "done" | "blocked";
export type EmployeeStatus = "active" | "inactive";
export type EmployeeHierarchyLevel = "L1" | "L2" | "L3" | "L4" | "L5" | "L6";
export type EmployeeCostType = "direct" | "indirect";
export type DailyReportStatus = "draft" | "submitted" | "validated" | "rejected";
export type CalculationRunStatus = "draft" | "approved" | "published" | "superseded";
export type PmtCollectionMode = "self_report" | "observer" | "hybrid";

export type ActivityCode = {
  code: number;
  label: string;
  group: "productive" | "indirect" | "loss";
  description: string;
};

export type PmtStudy = {
  id: string;
  tenantId: string;
  name: string;
  client: string;
  plant: string;
  area: string;
  operationalArea?: string;
  periodStart: string;
  periodEnd: string;
  status: PmtStudyStatus;
  methodologyVersion: string;
  benchmarkSegment: string;
  activityCatalogVersion: string;
  hierarchyCatalogVersion: string;
  roleCatalogVersion: string;
  collectionMode: PmtCollectionMode;
  targetCoverage: number;
  plannedCollectionDays?: number;
  plannedEmployeeSample?: number;
  costingMode?: "direct_indirect" | "direct_only" | "later";
  teams?: string[];
  shifts?: string[];
  disciplines?: string[];
  projectHierarchy?: Array<{
    level: EmployeeHierarchyLevel;
    label: string;
    scope: string;
    canSelfReport: boolean;
  }>;
  projectRoles?: Array<{
    sourceName: string;
    projectName: string;
    discipline: string;
    hierarchyLevel: EmployeeHierarchyLevel;
    hierarchyLabel: string;
    costType: EmployeeCostType;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeRegistryOptions = {
  units: string[];
  maintenanceAreas: string[];
  teams: string[];
  shifts: string[];
  disciplines: string[];
  roles: Array<{
    name: string;
    discipline: string;
    hierarchyLevel: EmployeeHierarchyLevel;
    hierarchyLabel: string;
    costType: EmployeeCostType;
  }>;
  hierarchyLevels: Array<{
    level: EmployeeHierarchyLevel;
    label: string;
  }>;
};

export type PmtEmployee = {
  id: string;
  tenantId: string;
  employeeCode: string;
  fullName: string;
  email: string;
  companyUnit: string;
  maintenanceArea: string;
  team: string;
  shift: string;
  discipline: string;
  role: string;
  hierarchyLevel: EmployeeHierarchyLevel;
  hierarchyLabel: string;
  costType: EmployeeCostType;
  hourlyCost: number;
  status: EmployeeStatus;
  canSelfReport: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PmtDailyReport = {
  id: string;
  tenantId: string;
  studyId: string;
  employeeId: string;
  reportDate: string;
  shift: string;
  totalReportedSeconds: number;
  status: DailyReportStatus;
  submittedAt?: string;
  validatedAt?: string;
  validationNote?: string;
};

export type PmtDailyReportEntry = {
  id: string;
  tenantId: string;
  dailyReportId: string;
  sequence: number;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  workOrder: string;
  activityCode: number;
  note?: string;
};

export type PmtObservation = {
  id: string;
  tenantId: string;
  studyId: string;
  observedAt: string;
  timezone: string;
  observer: string;
  collaboratorCode: string;
  team: string;
  shift: string;
  discipline: string;
  workOrder: string;
  activityCode: number;
  durationSeconds: number;
  status: ObservationStatus;
  note?: string;
};

export type PmtAction = {
  id: string;
  tenantId: string;
  studyId: string;
  title: string;
  owner: string;
  dueDate: string;
  status: ActionStatus;
  estimatedBenefitPercent: number;
};

export type CalculationResult = {
  studyId: string;
  totalSeconds: number;
  productiveSeconds: number;
  aPercent: number;
  travelPercent: number;
  fatiguePercent: number;
  fpPercent: number;
  coveragePercent: number;
  snapshotHash: string;
  algorithmVersion: string;
};

export type PmtCalculationRun = CalculationResult & {
  id: string;
  tenantId: string;
  status: CalculationRunStatus;
  methodologyVersion: string;
  validatedReportCount: number;
  entryCount: number;
  createdAt: string;
  createdBy: string;
  publishedAt?: string;
};
