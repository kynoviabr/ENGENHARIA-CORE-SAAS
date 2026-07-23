import type { EmployeeCostType, EmployeeHierarchyLevel } from "@/features/pmt/types";

export type PmtHierarchyCatalogItem = {
  level: EmployeeHierarchyLevel;
  label: string;
  defaultScope: string;
  canSelfReport: boolean;
};

export type PmtRoleCatalogItem = {
  name: string;
  discipline: string;
  defaultHierarchyLevel: EmployeeHierarchyLevel;
  defaultCostType: EmployeeCostType;
  defaultSelfReport: boolean;
};

export type PmtBenchmarkCatalogItem = {
  segment: string;
  referenceFpPercent: number;
  methodologyVersion: string;
  applicability: string;
};

export type PmtCalculationMemoryItem = {
  key: string;
  label: string;
  formula: string;
  description: string;
};

export const hierarchyCatalog: PmtHierarchyCatalogItem[] = [
  { level: "L1", label: "Diretor", defaultScope: "Direção da empresa ou unidade", canSelfReport: false },
  { level: "L2", label: "Gerente", defaultScope: "Gestão da manutenção ou operação", canSelfReport: false },
  { level: "L3", label: "Supervisor", defaultScope: "Supervisão de equipes e turnos", canSelfReport: false },
  { level: "L4", label: "Mecânico", defaultScope: "Execução técnica de manutenção mecânica", canSelfReport: true },
  { level: "L5", label: "Eletricista", defaultScope: "Execução técnica de manutenção elétrica", canSelfReport: true },
  { level: "L6", label: "Ajudante", defaultScope: "Apoio operacional em campo", canSelfReport: true }
];

export const roleCatalog: PmtRoleCatalogItem[] = [
  { name: "Mecânico mantenedor", discipline: "Mecânica", defaultHierarchyLevel: "L4", defaultCostType: "direct", defaultSelfReport: true },
  { name: "Eletricista industrial", discipline: "Elétrica", defaultHierarchyLevel: "L5", defaultCostType: "direct", defaultSelfReport: true },
  { name: "Instrumentista", discipline: "Instrumentação", defaultHierarchyLevel: "L5", defaultCostType: "direct", defaultSelfReport: true },
  { name: "Caldeireiro", discipline: "Caldeiraria", defaultHierarchyLevel: "L4", defaultCostType: "direct", defaultSelfReport: true },
  { name: "Supervisor de manutenção", discipline: "Gestão", defaultHierarchyLevel: "L3", defaultCostType: "indirect", defaultSelfReport: false },
  { name: "Planejador de manutenção", discipline: "Planejamento", defaultHierarchyLevel: "L3", defaultCostType: "indirect", defaultSelfReport: false }
];

export const benchmarkCatalog: PmtBenchmarkCatalogItem[] = [
  {
    segment: "Manutenção industrial contínua",
    referenceFpPercent: 78,
    methodologyVersion: "braidotti-pmt-v2.0",
    applicability: "Plantas com rotina recorrente, equipes por turno e ordens de serviço estruturadas."
  },
  {
    segment: "Parada ou campanha intensiva",
    referenceFpPercent: 82,
    methodologyVersion: "braidotti-pmt-v2.0",
    applicability: "Janelas concentradas de execução com alta mobilização de terceiros e supervisão dedicada."
  },
  {
    segment: "Manutenção predial ou facilities",
    referenceFpPercent: 74,
    methodologyVersion: "braidotti-pmt-v2.0",
    applicability: "Equipes multifuncionais, deslocamento relevante e chamados de baixa previsibilidade."
  }
];

export const calculationMemoryCatalog: PmtCalculationMemoryItem[] = [
  {
    key: "A",
    label: "Produtividade média",
    formula: "A = tempo produtivo / tempo total x 100",
    description: "Mede a proporção do tempo validado classificada como execução produtiva."
  },
  {
    key: "T",
    label: "Deslocamento",
    formula: "T = tempo no código 120 / tempo total x 100",
    description: "Captura o peso dos deslocamentos dentro da rotina observada ou apontada."
  },
  {
    key: "X",
    label: "Fator de fadiga",
    formula: "X = faixa aplicada conforme produtividade média",
    description: "Parâmetro metodológico aplicado na composição do fator de produtividade."
  },
  {
    key: "FP",
    label: "Fator de produtividade",
    formula: "FP = (A + 0,075 x A + T) x (1 + X / 100)",
    description: "Resultado oficial usado para diagnóstico, benchmark e plano de ação."
  }
];
