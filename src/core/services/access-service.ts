import { coreStore } from "../mock-store";

export interface RoleListItem {
  id: string;
  name: string;
  scope: "global" | "tenant";
  permissions: number;
  members: number;
  description: string;
}

export interface CheckAccessInput {
  tenantId: string;
  userId: string;
  productCode: string;
  moduleCode?: string;
  permission: string;
  resourceType?: string;
  resourceId?: string;
}

export type AccessDenyReason =
  | "tenant_not_found"
  | "tenant_inactive"
  | "user_not_found"
  | "membership_inactive"
  | "contract_inactive"
  | "subscription_inactive"
  | "product_inactive"
  | "module_inactive"
  | "entitlement_missing"
  | "resource_not_covered"
  | "permission_denied";

export interface CheckAccessResult {
  allowed: boolean;
  reason: AccessDenyReason | null;
}

export function listPermissions(): string[] {
  return coreStore.permissions.map((permission) => permission.code);
}

export function listRoles(): RoleListItem[] {
  return coreStore.roles.map((role) => ({
    id: role.id,
    name: role.name,
    scope: role.scope,
    permissions: role.permissionIds.length,
    members: coreStore.userRoles.filter((item) => item.roleId === role.id).length,
    description: role.description,
  }));
}

export function getAccessSummary() {
  return {
    roles: coreStore.roles.length,
    permissions: coreStore.permissions.length,
    checkAccessContracts: 1,
  };
}

export function checkAccess(input: CheckAccessInput): CheckAccessResult {
  const tenant = coreStore.tenants.find((item) => item.id === input.tenantId);
  if (!tenant) return deny("tenant_not_found");
  if (tenant.status !== "active") return deny("tenant_inactive");

  const user = coreStore.users.find((item) => item.id === input.userId);
  if (!user) return deny("user_not_found");

  const membership = coreStore.memberships.find(
    (item) => item.tenantId === input.tenantId && item.userId === input.userId,
  );
  if (!membership || membership.status !== "active" || user.status !== "active") {
    return deny("membership_inactive");
  }

  const contract = coreStore.contracts.find((item) => item.tenantId === input.tenantId);
  if (!contract || contract.status !== "active") return deny("contract_inactive");

  const subscription = coreStore.subscriptions.find((item) => item.contractId === contract.id);
  if (!subscription || !["active", "trial"].includes(subscription.status)) {
    return deny("subscription_inactive");
  }

  const product = coreStore.products.find((item) => item.code === input.productCode);
  if (!product || product.status !== "active") return deny("product_inactive");

  const productModule = input.moduleCode
    ? coreStore.modules.find((item) => item.productId === product.id && item.code === input.moduleCode)
    : null;
  if (input.moduleCode && (!productModule || productModule.status !== "active")) {
    return deny("module_inactive");
  }

  const entitlement = coreStore.entitlements.find(
    (item) =>
      item.tenantId === input.tenantId &&
      item.productId === product.id &&
      item.status === "active" &&
      item.resourceType === null &&
      item.resourceId === null &&
      (!productModule || item.moduleId === productModule.id || item.moduleId === null),
  );
  if (!entitlement) return deny("entitlement_missing");

  if (input.resourceType && input.resourceId) {
    const resourceCoveredByEntitlement = coreStore.entitlements.some(
      (item) =>
        item.tenantId === input.tenantId &&
        item.productId === product.id &&
        item.status === "active" &&
        item.resourceType === input.resourceType &&
        item.resourceId === input.resourceId &&
        (!productModule || item.moduleId === productModule.id || item.moduleId === null),
    );

    const resourceCoveredByScope = coreStore.contractScopes.some(
      (scope) =>
        scope.tenantId === input.tenantId &&
        scope.contractId === contract.id &&
        scope.productId === product.id &&
        scope.status === "active" &&
        scope.resourceType === input.resourceType &&
        scope.resourceId === input.resourceId,
    );

    if (!resourceCoveredByEntitlement && !resourceCoveredByScope) {
      return deny("resource_not_covered");
    }
  }

  const roleIds = coreStore.userRoles
    .filter((item) => item.tenantId === input.tenantId && item.userId === input.userId)
    .map((item) => item.roleId);
  const permissionIds = new Set(
    coreStore.roles
      .filter((role) => roleIds.includes(role.id))
      .flatMap((role) => role.permissionIds),
  );
  const requestedPermission = coreStore.permissions.find((item) => item.code === input.permission);

  if (!requestedPermission || !permissionIds.has(requestedPermission.id)) {
    return deny("permission_denied");
  }

  return {
    allowed: true,
    reason: null,
  };
}

function deny(reason: AccessDenyReason): CheckAccessResult {
  return {
    allowed: false,
    reason,
  };
}
