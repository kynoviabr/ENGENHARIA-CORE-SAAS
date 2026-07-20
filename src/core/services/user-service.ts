import { coreStore } from "../mock-store";

export interface UserMembershipListItem {
  id: string;
  name: string;
  email: string;
  tenant: string;
  role: string;
  status: "invited" | "active" | "suspended" | "removed";
  lastAccess: string;
}

export function listUserMemberships(): UserMembershipListItem[] {
  return coreStore.memberships.map((membership) => {
    const user = coreStore.users.find((item) => item.id === membership.userId);
    const tenant = coreStore.tenants.find((item) => item.id === membership.tenantId);
    const userRole = coreStore.userRoles.find(
      (item) => item.userId === membership.userId && item.tenantId === membership.tenantId,
    );
    const role = coreStore.roles.find((item) => item.id === userRole?.roleId);

    return {
      id: membership.id,
      name: user?.name ?? "Usuário desconhecido",
      email: user?.email ?? "-",
      tenant: tenant?.tradeName ?? "Tenant desconhecido",
      role: role?.name ?? "sem_papel",
      status: membership.status,
      lastAccess: user?.lastAccessAt ? user.lastAccessAt.replace("T", " ").replace(":00Z", "") : "-",
    };
  });
}

export function getUserSummary() {
  const memberships = listUserMemberships();

  return {
    total: memberships.length,
    invited: memberships.filter((item) => item.status === "invited").length,
    active: memberships.filter((item) => item.status === "active").length,
    roleCount: new Set(memberships.map((item) => item.role)).size,
  };
}
