import { coreStore } from "../mock-store";

export interface ContractListItem {
  id: string;
  tenant: string;
  plan: string;
  status: "trial" | "active" | "pending" | "past_due" | "suspended" | "cancelled" | "expired";
  period: string;
  limits: string;
}

export function listContracts(): ContractListItem[] {
  return coreStore.contracts.map((contract) => {
    const tenant = coreStore.tenants.find((item) => item.id === contract.tenantId);
    const plan = coreStore.plans.find((item) => item.id === contract.planId);
    const subscription = coreStore.subscriptions.find((item) => item.contractId === contract.id);
    const usage = coreStore.usageLimits.find(
      (item) => item.tenantId === contract.tenantId && item.code === "maximum_users",
    );

    return {
      id: contract.id,
      tenant: tenant?.tradeName ?? "Tenant desconhecido",
      plan: plan?.name ?? "Sem plano",
      status: subscription?.status ?? "pending",
      period: `${contract.startDate} / ${contract.endDate}`,
      limits: usage ? `${usage.limit} usuários` : "Sem limite",
    };
  });
}

export function getContractSummary() {
  const contracts = listContracts();

  return {
    total: contracts.length,
    trial: contracts.filter((item) => item.status === "trial").length,
    suspended: contracts.filter((item) => item.status === "suspended").length,
  };
}
