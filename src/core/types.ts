export type TenantStatus = "pending" | "active" | "suspended" | "cancelled";
export type MembershipStatus = "invited" | "active" | "suspended" | "removed";
export type RoleScope = "global" | "tenant";
export type CatalogStatus = "active" | "pending" | "planned" | "suspended";
export type ContractStatus = "draft" | "pending" | "active" | "expired" | "suspended" | "cancelled" | "closed";
export type SubscriptionStatus = "trial" | "active" | "pending" | "past_due" | "suspended" | "cancelled" | "expired";
export type EntitlementSource = "plan" | "contract" | "subscription" | "trial" | "manual" | "core";
export type BillingCycle = "monthly" | "quarterly" | "yearly" | "trial";
export type BillingModel = "flat" | "per_user" | "per_resource" | "per_unit" | "usage_based" | "custom";

export interface Tenant {
  id: string;
  legalName: string;
  tradeName: string;
  document: string;
  email: string;
  phone: string;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CoreUser {
  id: string;
  name: string;
  email: string;
  status: "active" | "invited" | "suspended";
  lastAccessAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TenantMembership {
  id: string;
  tenantId: string;
  userId: string;
  status: MembershipStatus;
  invitedBy: string | null;
  joinedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  code: string;
  description: string;
}

export interface Role {
  id: string;
  tenantId: string | null;
  name: string;
  scope: RoleScope;
  description: string;
  permissionIds: string[];
}

export interface UserRole {
  id: string;
  tenantId: string;
  userId: string;
  roleId: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  status: CatalogStatus;
}

export interface ProductModule {
  id: string;
  productId: string;
  code: string;
  name: string;
  description: string;
  status: CatalogStatus;
}

export interface Plan {
  id: string;
  code: string;
  name: string;
  description: string;
  billingCycle: BillingCycle;
  status: CatalogStatus;
  maximumUsers: number;
}

export interface Contract {
  id: string;
  tenantId: string;
  planId: string;
  contractNumber: string;
  billingCycle: BillingCycle;
  startDate: string;
  endDate: string;
  renewalDate: string;
  status: ContractStatus;
  notes: string | null;
}

export interface ContractItem {
  id: string;
  tenantId: string;
  contractId: string;
  productId: string | null;
  moduleId: string | null;
  itemType: string;
  description: string;
  billingModel: BillingModel;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  startsAt: string;
  endsAt: string | null;
  status: CatalogStatus;
  metadata: Record<string, unknown>;
}

export interface ContractScope {
  id: string;
  tenantId: string;
  contractId: string;
  contractItemId: string | null;
  productId: string | null;
  resourceType: string;
  resourceId: string;
  resourceCode: string;
  displayName: string | null;
  status: CatalogStatus;
  startsAt: string;
  expiresAt: string | null;
  metadata: Record<string, unknown>;
}

export interface ExternalResource {
  id: string;
  tenantId: string;
  productId: string | null;
  resourceType: string;
  externalId: string;
  code: string;
  displayName: string | null;
  status: CatalogStatus;
  metadata: Record<string, unknown>;
}

export interface Subscription {
  id: string;
  tenantId: string;
  contractId: string;
  planId: string;
  status: SubscriptionStatus;
  startedAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
}

export interface Entitlement {
  id: string;
  tenantId: string;
  productId: string;
  moduleId: string | null;
  resourceType: string | null;
  resourceId: string | null;
  status: CatalogStatus;
  source: EntitlementSource;
  sourceId: string | null;
  startsAt: string;
  expiresAt: string | null;
  metadata: Record<string, unknown>;
}

export interface UsageLimit {
  id: string;
  tenantId: string;
  code: string;
  limit: number;
  used: number;
}

export interface BrandingSettings {
  id: string;
  tenantId: string;
  name: string;
  logoUrl: string | null;
  smallLogoUrl: string | null;
  faviconUrl: string | null;
  loginImageUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  supportEmail: string;
  supportPhone: string;
  termsUrl: string | null;
  privacyUrl: string | null;
}

export interface AuditLog {
  id: string;
  tenantId: string | null;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface CoreStore {
  tenants: Tenant[];
  users: CoreUser[];
  memberships: TenantMembership[];
  permissions: Permission[];
  roles: Role[];
  userRoles: UserRole[];
  products: Product[];
  modules: ProductModule[];
  plans: Plan[];
  contracts: Contract[];
  contractItems: ContractItem[];
  contractScopes: ContractScope[];
  externalResources: ExternalResource[];
  subscriptions: Subscription[];
  entitlements: Entitlement[];
  usageLimits: UsageLimit[];
  branding: BrandingSettings[];
  auditLogs: AuditLog[];
}
