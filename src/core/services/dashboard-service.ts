import { coreStore } from "../mock-store";
import { checkAccess } from "./access-service";
import { listTenants } from "./tenant-service";

export function getDashboardMetrics() {
  const tenants = listTenants();
  const activeTenants = tenants.filter((tenant) => tenant.status === "active").length;
  const users = coreStore.memberships.length;
  const modules = coreStore.modules.length;
  const contracts = coreStore.contracts.length;

  return [
    {
      label: "Tenants ativos",
      value: activeTenants.toString(),
      detail: `${tenants.filter((tenant) => tenant.status === "pending").length} em onboarding`,
      tone: "green",
    },
    {
      label: "Usuários vinculados",
      value: users.toString(),
      detail: "RBAC por empresa",
      tone: "blue",
    },
    {
      label: "Módulos publicados",
      value: modules.toString(),
      detail: "catálogo genérico",
      tone: "blue",
    },
    {
      label: "Contratos monitorados",
      value: contracts.toString(),
      detail: `${coreStore.contracts.filter((contract) => contract.status === "active").length} ativos`,
      tone: "yellow",
    },
  ] as const;
}

export function getAccessPreview() {
  return checkAccess({
    tenantId: "tenant_kynovia_labs",
    userId: "user_amanda",
    productCode: "core-platform",
    moduleCode: "identity",
    permission: "platform.users.view",
  });
}
