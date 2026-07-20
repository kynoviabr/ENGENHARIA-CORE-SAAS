import { coreStore } from "../mock-store";

export interface TenantListItem {
  id: string;
  name: string;
  legalName: string;
  document: string;
  status: "pending" | "active" | "suspended" | "cancelled";
  users: number;
  plan: string;
  renewal: string;
}

export function listTenants(): TenantListItem[] {
  return coreStore.tenants.map((tenant) => {
    const contract = coreStore.contracts.find((item) => item.tenantId === tenant.id);
    const plan = coreStore.plans.find((item) => item.id === contract?.planId);
    const usage = coreStore.usageLimits.find(
      (item) => item.tenantId === tenant.id && item.code === "maximum_users",
    );

    return {
      id: tenant.id,
      name: tenant.tradeName,
      legalName: tenant.legalName,
      document: tenant.document,
      status: tenant.status,
      users: usage?.used ?? 0,
      plan: plan?.name ?? "Sem plano",
      renewal: contract?.renewalDate ?? "-",
    };
  });
}

export function getTenantSummary() {
  const tenants = listTenants();

  return {
    total: tenants.length,
    active: tenants.filter((tenant) => tenant.status === "active").length,
    pending: tenants.filter((tenant) => tenant.status === "pending").length,
    suspended: tenants.filter((tenant) => tenant.status === "suspended").length,
  };
}
